This is staff mangement system

We have divided into two parts mainly front end and backend

Front End(Reactjs)
    Components:
        login
        home
        staff
        shift
        role,
        attendance
        staff scheduler


Backend(Expressjs)

POST /login

Req: 
{
  "userName": "admin",
  "password": "encrypted-or-plain-based-on-your-design"
}

Res:
{
  "accessToken": "jwt-token-string",
  "expiresIn": 3600,
  "user": {
    "id": "d1f7e3b4-1c9b-4d7f-9044-b5c90f3c9f01",
    "userName": "admin",
    "role": "ADMIN",
    "staffId": UUID
  }
}

GET /staff

{
  "items": [
    {
      "id": "uuid-staff-1",
      "staffCode": "N001",
      "staffName": "ME someone ",
      "role": "NURSE",
      "contactNo": "9876543210",
      "email": "some@example.com",
      "preferredShift": "M",
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalItems": 1,
  "totalPages": 1
}

GET /staff/{id}

    {
      "id": "uuid-staff-1",
      "staffCode": "N001",
      "staffName": "ME someone ",
      "role": "NURSE",
      "contactNo": "9876543210",
      "email": "some@example.com",
      "preferredShift": "M",
    }

POST /staff
Req: 

{
  "staffCode": "N002",
  "staffName": "Someone",
  "role": "NURSE",
  "contactNo": "9876500000",
  "email": "some@example.com",
  "preferredShift": "N"
}

Res: 

{
“Id”: “uuid”
  "staffCode": "N002",
  "staffName": "Someone",
  "role": "NURSE",
  "contactNo": "9876500000",
  "email": "some@example.com",
  "preferredShift": "N"
}

GET /shifts

{
  "items": [
    {
      "id": "uuid-shift-1",
      "staffId": "uuid-staff-1",
      "date": "2025-11-01",
      "timeSlot": "M",
      "startTime": "08:00",
      "endTime": "16:00",
    }
  ],
  "page": 1,
  "pageSize": 50,
  "totalItems": 1,
  "totalPages": 1
}

POST /shifts

Req: 

{
  "shifts": [
    {
      "staffId": "uuid-staff-1",
      "date": "2025-11-28",
      "timeSlot": "M",
      "startTime": "08:00",
      "endTime": "16:00",
    },
    {
      "staffId": "uuid-staff-2",
      "date": "2025-11-28",
      "timeSlot": "N",
      "startTime": "22:00",
      "endTime": "06:00",
    }
  ]
}

Res: 
{
  "shifts": [
    {
      "id": "uuid-shift-10",
      "staffId": "uuid-staff-1",
      "date": "2025-11-28",
      "timeSlot": "M",
      "startTime": "08:00",
      "endTime": "16:00",
    },
    {
      "id": "uuid-shift-11",
      "staffId": "uuid-staff-2",
      "date": "2025-11-28",
      "timeSlot": "N",
      "startTime": "22:00",
      "endTime": "06:00"
    }
  ]
}


GET /attendance

{
  "items": [
    {
      "id": "uuid-att-1",
      "staffId": "uuid-staff-1",
      "date": "2025-11-01",
      "status": "PRESENT",
      "comment": "On time",
      "recordedAt": "2025-11-01T06:05:00Z"
    },
    {
      "id": "uuid-att-2",
      "staffId": "uuid-staff-1",
      "date": "2025-11-02",
      "status": "ABSENT",
      "comment": "Sick leave",
    }
  ],
  "page": 1,
  "pageSize": 31,
  "totalItems": 2,
  "totalPages": 1
}

GET /attendance/{staffId}?dateFrom=2025-11-01&dateTo=2025-11-30


{
  "items": [
    {
      "id": "uuid-att-1",
      "staffId": "uuid-staff-1",
      "date": "2025-11-01",
      "status": "PRESENT",
      "comment": "On time",
      "recordedAt": "2025-11-01T06:05:00Z"
    },
    {
      "id": "uuid-att-2",
      "staffId": "uuid-staff-1",
      "date": "2025-11-02",
      "status": "ABSENT",
      "comment": "Sick leave",
    }
  ],
  "page": 1,
  "pageSize": 31,
  "totalItems": 2,
  "totalPages": 1
}

POST /attendance

Req: 

{
  "records": [
    {
      "staffId": "uuid-staff-1",
      "date": "2025-11-28",
      "status": "PRESENT",
      "comment": "Came 10 mins late"
    },
    {
      "staffId": "uuid-staff-2",
      "date": "2025-11-28",
      "status": "ABSENT",
      "comment": "Sick"
    }
  ]
}


Database (Postgress)
    Tables:
        staff:(1d,staffname,roleid,preferenceshift)

        Shift(id,shitname)

        Attendance(id,staffid,ispresent)

        Staff Scheduler(id,staffid,shitftid,time)
