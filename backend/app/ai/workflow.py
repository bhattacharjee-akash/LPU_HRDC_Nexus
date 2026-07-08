from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from sqlalchemy.orm import Session

from backend.app.ai.agents import (
    classify_intent, handle_attendance_query, handle_program_query,
    handle_rag_query, handle_analytics_query, call_groq_llm, validate_response
)

# 1. State Definition
class AgentState(TypedDict):
    query: str
    intent: str
    db_context: str
    rag_results: List[Dict[str, Any]]
    response: str
    sources: List[str]
    db: Session

# 2. Node Functions
def intent_node(state: AgentState) -> Dict[str, Any]:
    intent = classify_intent(state["query"])
    return {"intent": intent}

def attendance_node(state: AgentState) -> Dict[str, Any]:
    context = handle_attendance_query(state["db"], state["query"])
    return {"db_context": context}

def program_node(state: AgentState) -> Dict[str, Any]:
    context = handle_program_query(state["db"], state["query"])
    return {"db_context": context}

def rag_node(state: AgentState) -> Dict[str, Any]:
    results = handle_rag_query(state["db"], state["query"])
    sources = list(set([r["document_title"] + f" ({r['file_url']})" for r in results]))
    return {"rag_results": results, "sources": sources}

def analytics_node(state: AgentState) -> Dict[str, Any]:
    context = handle_analytics_query(state["db"], state["query"])
    return {"db_context": context}

def general_node(state: AgentState) -> Dict[str, Any]:
    # General chat node
    return {"db_context": "No database context needed for general query."}

def report_node(state: AgentState) -> Dict[str, Any]:
    # Compile all context
    context_str = f"Intent: {state['intent']}\n"
    if state["db_context"]:
        context_str += f"Database Context:\n{state['db_context']}\n"
    if state["rag_results"]:
        context_str += "Retrieved PDF/Slides/Notes Passages:\n"
        for idx, chunk in enumerate(state["rag_results"]):
            context_str += f"[{idx+1}] Source: {chunk['document_title']}\nContent: {chunk['text_content']}\n\n"
            
    system_prompt = (
        "You are the LPU HRDC Nexus Assistant, a professional training lifecycle coordinator. "
        "Your task is to answer the user query based ONLY on the provided context. "
        "If you do not know the answer, do not make it up. Cite the sources where applicable. "
        "Be concise, professional, and clear."
    )
    user_prompt = f"Context:\n{context_str}\n\nUser Query: {state['query']}"
    
    response = call_groq_llm(system_prompt, user_prompt)
    return {"response": response}

def validation_node(state: AgentState) -> Dict[str, Any]:
    context_str = state["db_context"] or ""
    if state["rag_results"]:
        context_str += "\n".join([r["text_content"] for r in state["rag_results"]])
        
    is_valid = validate_response(state["response"], state["query"], context_str)
    
    # If not valid, we append a warning or correct it
    if not is_valid:
         corrected_response = state["response"] + "\n\n*(Note: This response was flagged by validation filters for audit)*"
         return {"response": corrected_response}
    return {}

# 3. Router Decision Function
def router_decision(state: AgentState) -> str:
    intent = state.get("intent", "general")
    if intent == "attendance":
        return "attendance"
    elif intent == "program":
        return "program"
    elif intent == "rag":
        return "rag"
    elif intent == "analytics":
        return "analytics"
    else:
        return "general"

# 4. Build Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("intent", intent_node)
workflow.add_node("attendance", attendance_node)
workflow.add_node("program", program_node)
workflow.add_node("rag", rag_node)
workflow.add_node("analytics", analytics_node)
workflow.add_node("general", general_node)
workflow.add_node("report", report_node)
workflow.add_node("validation", validation_node)

# Add Connections
workflow.set_entry_point("intent")

# Routing from intent node to individual handler nodes
workflow.add_conditional_edges(
    "intent",
    router_decision,
    {
        "attendance": "attendance",
        "program": "program",
        "rag": "rag",
        "analytics": "analytics",
        "general": "general"
    }
)

# Connect all handler nodes to report generator
workflow.add_edge("attendance", "report")
workflow.add_edge("program", "report")
workflow.add_edge("rag", "report")
workflow.add_edge("analytics", "report")
workflow.add_edge("general", "report")

# Connect report generator to validation node
workflow.add_edge("report", "validation")
workflow.add_edge("validation", END)

# Compile Graph
compiled_graph = workflow.compile()

# Execution interface
def query_hrdc_assistant(db: Session, query_text: str) -> Dict[str, Any]:
    initial_state = {
        "query": query_text,
        "intent": "general",
        "db_context": "",
        "rag_results": [],
        "response": "",
        "sources": [],
        "db": db
    }
    result = compiled_graph.invoke(initial_state)
    return {
        "response": result["response"],
        "sources": result["sources"]
    }
