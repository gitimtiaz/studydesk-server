# StudyDesk Server

> Express + MongoDB backend for StudyDesk

## Base URL (production)
_Add after Render deploy_

## API Routes

### Auth
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/google | Public |
| POST | /api/auth/logout | Public |
| GET | /api/auth/me | Private |

### Rooms
| Method | Route | Access |
|---|---|---|
| GET | /api/rooms | Public |
| GET | /api/rooms/latest | Public |
| GET | /api/rooms/:id | Public |
| POST | /api/rooms | Private |
| PUT | /api/rooms/:id | Private (owner) |
| DELETE | /api/rooms/:id | Private (owner) |
| GET | /api/rooms/my-listings | Private |

### Bookings
| Method | Route | Access |
|---|---|---|
| POST | /api/bookings | Private |
| GET | /api/bookings/my-bookings | Private |
| PATCH | /api/bookings/:id/cancel | Private |

## Environment Variables
See `.env.example`