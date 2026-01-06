# 🧪 Frontend Testing Checklist

## ✅ Quick Test Guide

### Prerequisites
- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend server running on `http://localhost:3000`

---

## 1. Backend Connection Test

**Test:** Open `http://localhost:3000`
- [ ] Page loads without errors
- [ ] Should redirect to `/login` if not authenticated
- [ ] No console errors

---

## 2. Authentication Test

### 2.1 Login
- [ ] Go to `/login`
- [ ] Enter valid credentials
- [ ] Click "Sign In"
- [ ] Should redirect to `/dashboard`
- [ ] Token should be stored in localStorage

### 2.2 Invalid Login
- [ ] Try wrong password
- [ ] Should show error message
- [ ] Should NOT redirect

### 2.3 Protected Routes
- [ ] Try accessing `/dashboard` without login
- [ ] Should redirect to `/login`

---

## 3. Dashboard Test

### 3.1 Admin Dashboard
- [ ] Login as admin
- [ ] Should see "Admin Dashboard" title
- [ ] Should see 5 stat cards
- [ ] Should see all quick action buttons
- [ ] Should see "User Management" button

### 3.2 Receptionist Dashboard
- [ ] Login as receptionist
- [ ] Should see "Receptionist Dashboard" title
- [ ] Should see 2 stat cards
- [ ] Should see only appointment-related buttons
- [ ] Should NOT see "User Management", "Services", or "Working Hours"

---

## 4. Appointments Test

### 4.1 View Appointments
- [ ] Go to `/appointments`
- [ ] Should load list of appointments
- [ ] Should show customer name, service, date, time, status
- [ ] Table should be formatted correctly

### 4.2 Create Appointment
- [ ] Click "New Appointment" button
- [ ] Fill in customer name
- [ ] Fill in phone (10+ digits)
- [ ] Select a service
- [ ] Select a date
- [ ] Wait for available slots to load
- [ ] Select a time slot
- [ ] Click "Create Appointment"
- [ ] Should redirect to appointments list
- [ ] New appointment should appear

### 4.3 Conflict Detection
- [ ] Try booking same time slot twice
- [ ] Should show error message
- [ ] Should NOT create duplicate

---

## 5. Services Management (Admin Only)

### 5.1 View Services
- [ ] Login as admin
- [ ] Go to `/services`
- [ ] Should see list of services
- [ ] Should see "New Service" button

### 5.2 Create Service
- [ ] Click "New Service"
- [ ] Fill in name, description, duration, price
- [ ] Click "Create Service"
- [ ] Should appear in list

### 5.3 Edit Service
- [ ] Click "Edit" on a service
- [ ] Modify fields
- [ ] Click "Update Service"
- [ ] Changes should be saved

### 5.4 Deactivate Service
- [ ] Click "Deactivate" on a service
- [ ] Confirm deletion
- [ ] Service should disappear from list

### 5.5 Receptionist Access
- [ ] Login as receptionist
- [ ] Try to access `/services`
- [ ] Should show "Admin access required"

---

## 6. Working Hours (Admin Only)

### 6.1 View Working Hours
- [ ] Login as admin
- [ ] Go to `/working-hours`
- [ ] Should see table with all days
- [ ] Should show open/close times

### 6.2 Update Working Hours
- [ ] Click "Edit" on a day
- [ ] Change open/close times
- [ ] Click "Save"
- [ ] Changes should be saved

### 6.3 Close a Day
- [ ] Click "Edit" on a day
- [ ] Check "Closed" checkbox
- [ ] Click "Save"
- [ ] Day should show as "Closed"

---

## 7. User Management (Admin Only)

### 7.1 View Users
- [ ] Login as admin
- [ ] Go to `/users`
- [ ] Should see list of all users
- [ ] Should see name, email, role, created date

### 7.2 Create User
- [ ] Click "New User"
- [ ] Fill in name, email, password, role
- [ ] Click "Create User"
- [ ] User should appear in list

### 7.3 Edit User
- [ ] Click "Edit" on a user
- [ ] Change name or email
- [ ] Optionally change password
- [ ] Click "Update User"
- [ ] Changes should be saved

### 7.4 Delete User
- [ ] Click "Delete" on a user (not yourself)
- [ ] Confirm deletion
- [ ] User should be removed

### 7.5 Security Tests
- [ ] Try to delete your own account
- [ ] Should show error "Cannot delete your own account"
- [ ] Try to change your own role
- [ ] Should show error "Cannot change your own role"

---

## 8. Navigation Test

- [ ] All links in dashboard work
- [ ] Back buttons work
- [ ] Logout works from all pages
- [ ] Browser back/forward buttons work

---

## 9. Error Handling Test

- [ ] Stop backend server
- [ ] Try to load appointments
- [ ] Should show error message (not crash)
- [ ] Start backend again
- [ ] Should work normally

---

## 10. Responsive Design Test

- [ ] Resize browser window
- [ ] Check mobile view (narrow window)
- [ ] Tables should scroll horizontally
- [ ] Buttons should stack on mobile

---

## ✅ Success Criteria

If all tests pass:
- ✅ Authentication works
- ✅ Role-based access works
- ✅ All CRUD operations work
- ✅ Error handling works
- ✅ Navigation works
- ✅ Frontend and backend communicate correctly

---

## 🐛 Common Issues

**Issue:** "Cannot connect to backend"
- Check if backend is running on port 5000
- Check browser console for CORS errors

**Issue:** "Token expired"
- Logout and login again
- Check if token is being stored

**Issue:** "Admin access required" when you're admin
- Check localStorage for user role
- Try logging out and back in

---

**Happy Testing!** 🚀

