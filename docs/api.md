# REST API Specifications

The LPU HRDC Nexus backend exposing Swagger specifications on `/docs` and endpoints under `/api/v1/`.

---

## 1. Authentication Endpoints

### Register User
* **URL**: `/api/v1/auth/register`
* **Method**: `POST`
* **Request Body**:
```json
{
  "email": "faculty@lpu.co.in",
  "password": "SecurePassword123!",
  "full_name": "Dr. Ramesh",
  "role": "participant",
  "department": "Computer Science"
}
```
* **Response**: Status Code `201 Created`

### Login Token
* **URL**: `/api/v1/auth/login`
* **Method**: `POST`
* **Content-Type**: `application/x-www-form-urlencoded`
* **Request Parameters**:
  * `username` (email)
  * `password`
* **Response**:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer"
}
```

---

## 2. Programme Management

### Create Programme
* **URL**: `/api/v1/programs/`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Role Check**: Admin, Staff
* **Request Body**:
```json
{
  "title": "Generative AI FDP 2026",
  "category": "FDP",
  "mode": "hybrid",
  "venue": "Block 32",
  "start_date": "2026-06-01T10:00:00Z",
  "end_date": "2026-06-07T17:00:00Z",
  "max_capacity": 50
}
```

---

## 3. Attendance Hub

### Mark Self Attendance
* **URL**: `/api/v1/attendance/mark`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
```json
{
  "session_id": 101,
  "verification_method": "gps",
  "latitude": 31.2536,
  "longitude": 75.7037
}
```

---

## 4. AI Orchestrator

### Assistant Chat
* **URL**: `/api/v1/ai/query`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Body**:
```json
{
  "query": "Who has less than 75% attendance in ML workshop?"
}
```
* **Response**:
```json
{
  "response": "According to the database logs: Dr. Rajesh Kumar is marked absent for 3 of 4 sessions, resulting in a 25.0% attendance rate.",
  "sources": ["ML_Attendance_Sheet.csv"]
}
```
