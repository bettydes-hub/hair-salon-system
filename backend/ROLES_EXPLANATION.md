# 👥 User Roles & Permissions

## Role Hierarchy

1. **Admin** - Full owner access
2. **Manager** - Management access (no user management)
3. **Receptionist** - Appointment management only
4. **Client** - Can book and view own appointments

---

## 🔐 Admin (Owner)

**Full system control - like the salon owner**

### Permissions:
- ✅ Manage all appointments
- ✅ Manage services (create/edit/delete)
- ✅ Manage working hours
- ✅ **Manage users** (create/edit/delete staff)
- ✅ View all reports and stats

### Restrictions:
- ❌ Cannot delete own account
- ❌ Cannot change own role

### Dashboard:
- Shows all stats (appointments, services, users)
- All management buttons visible

---

## 👔 Manager

**Management power - but NOT full owner access**

### Permissions:
- ✅ Manage appointments
- ✅ Manage services (create/edit/delete)
- ✅ Manage working hours
- ✅ View all appointments
- ✅ View reports

### Restrictions:
- ❌ **Cannot manage users** (no user creation/editing)
- ❌ Cannot access user management page

### Dashboard:
- Shows management stats (appointments, services)
- NO user management button
- Services and working hours accessible

---

## 📞 Receptionist

**Appointment management only**

### Permissions:
- ✅ View appointments
- ✅ Create appointments
- ✅ Update appointment status
- ✅ View today's schedule

### Restrictions:
- ❌ Cannot manage services
- ❌ Cannot manage working hours
- ❌ Cannot manage users
- ❌ Cannot view all reports

### Dashboard:
- Shows only appointment-related stats
- Limited quick actions

---

## 👤 Client (Customer)

**Can book and view own appointments**

### Permissions:
- ✅ View own appointments
- ✅ Book new appointments
- ✅ View available services
- ✅ View own appointment details

### Restrictions:
- ❌ Cannot edit appointments (must contact salon)
- ❌ Cannot cancel appointments (must contact salon)
- ❌ Cannot view other customers' appointments
- ❌ Cannot access staff features

### Dashboard:
- Shows only their own appointments
- Can book new appointments
- Can view available services

---

## 📊 Permission Matrix

| Feature | Admin | Manager | Receptionist | Client |
|---------|-------|---------|--------------|--------|
| View All Appointments | ✅ | ✅ | ✅ | ❌ (own only) |
| Create Appointment | ✅ | ✅ | ✅ | ✅ |
| Edit Appointment | ✅ | ✅ | ✅ | ❌ |
| Manage Services | ✅ | ✅ | ❌ | ❌ |
| Manage Working Hours | ✅ | ✅ | ❌ | ❌ |
| **Manage Users** | ✅ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ |

---

## 🎯 Key Differences

### Admin vs Manager:
- **Admin**: Can manage users (create/edit/delete staff)
- **Manager**: Cannot manage users (no access to user management)

### Manager vs Receptionist:
- **Manager**: Can manage services and working hours
- **Receptionist**: Cannot manage services or working hours

### Client vs Staff:
- **Client**: Can only see and book their own appointments
- **Staff**: Can see all appointments and manage them

---

## 🔧 Backend Implementation

### Decorators:
- `@admin_required` - Only admin
- `@manager_or_admin_required` - Manager or admin
- `@staff_required` - Admin, manager, or receptionist
- `@token_required` - Any authenticated user

### Route Access:
- **User Management**: `@admin_required` only
- **Services/Working Hours**: `@manager_or_admin_required`
- **Appointments (list)**: `@staff_required` (staff see all, clients see own)
- **Appointments (create)**: Public (anyone can book)

---

**Now you have 4 distinct roles with proper access control!** 🎉

