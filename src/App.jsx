import { useState } from 'react'
import './App.css'
import { supabase } from './supabase'
import { useEffect } from 'react'
function App() {
  const [facultyID] = useState("FAC-" + Math.floor(Math.random()*10000))
  const [activeSection, setActiveSection] = useState('Dashboard')
  const [studentForm, setStudentForm] = useState({
  fullName: '',
  usn: '',
  year: '',
  branch: '',
  phone: '',
  email: '',
  parentPhone: '',
  address: '',
  sem1: '',
  sem2: '',
  sem3: '',
  sem4: '',
  sem5: '',
  sem6: '',
  sem7: '',
  sem8: '',
  tenthMarks: '',
  twelvethMarks: '',
  backlogs: '',
  achievements: ''
})
const [editingStudentIndex, setEditingStudentIndex] = useState(null)
const [editingFacultyIndex, setEditingFacultyIndex] = useState(null)
const [facultyForm, setFacultyForm] = useState({
  facultyName: '',
  facultyId: facultyID,
  designation: '',
  department: '',
  email: '',
  phone: '',
  experience: '',
  subjectsHandled: '',
  officeRoom: '',
  researchArea: '',
  notes: ''
})

const [noticeForm, setNoticeForm] = useState({
  title: '',
  content: '',
  audience: '',
  date: ''
})
const [dashboardCounts, setDashboardCounts] = useState({
  students: 0,
  faculty: 0,
  mentors: 0,
  notices: 0
})

const [isLoggedIn, setIsLoggedIn] = useState(false)
const [role, setRole] = useState('')
const [loggedInMentor, setLoggedInMentor] = useState('')
const [selectedMenteeProfile, setSelectedMenteeProfile] = useState(null)
const [selectedMentor, setSelectedMentor] = useState('')
const [mentorStudents, setMentorStudents] = useState([])
const [mentorList, setMentorList] = useState([])
useEffect(() => {
  if (role === 'Mentor'){
      fetchMentorList()
  }
}, [role])
useEffect(() => {
  if (role === 'Mentor' && loggedInMentor) {
    fetchMentorStudents(loggedInMentor)
  }
}, [role, loggedInMentor])

const [notices, setNotices] = useState([])
const [facultySearchQuery, setFacultySearchQuery] = useState('')
const [facultySearchResult, setFacultySearchResult] = useState(null)
const [searchQuery, setSearchQuery] = useState('')
const [searchResult, setSearchResult] = useState(null)
const handleStudentChange = (e) => {
  setStudentForm({
    ...studentForm,
    [e.target.name]: e.target.value
  })
}
const handleFacultyChange = (e) => {
  setFacultyForm({
    ...facultyForm,
    [e.target.name]: e.target.value
  })
}
const handleFacultySubmit = async (e) => {
  e.preventDefault()

  const facultyData = {
    facultyName: facultyForm.facultyName,
    facultyId: facultyForm.facultyId,
    designation: facultyForm.designation,
    department: facultyForm.department,
    email: facultyForm.email,
    phone: facultyForm.phone,
    experience: facultyForm.experience || null,
    subjectsHandled: facultyForm.subjectsHandled,
    officeRoom: facultyForm.officeRoom,
    researchArea: facultyForm.researchArea,
    notes: facultyForm.notes
  }

  if (editingFacultyIndex !== null) {
    const { error } = await supabase
      .from('faculty')
      .update(facultyData)
      .eq('id', editingFacultyIndex)

    if (error) {
      console.error(error)
      alert('Error updating faculty')
      return
    }

    alert('Faculty updated successfully!')
  } else {
    const { error } = await supabase
      .from('faculty')
      .insert([facultyData])

    if (error) {
      console.error(error)
      alert('Error saving faculty')
      return
    }

    alert('Faculty saved successfully!')
  }

  setFacultyForm({
    facultyName: '',
    facultyId: '',
    designation: '',
    department: '',
    email: '',
    phone: '',
    experience: '',
    subjectsHandled: '',
    officeRoom: '',
    researchArea: '',
    notes: ''
  })

  setFacultySearchResult(null)
  setEditingFacultyIndex(null)
}
const handleFacultySearch = async () => {
  if (!facultySearchQuery) {
    alert("Enter faculty name or ID")
    return
  }

  const { data, error } = await supabase
    .from('faculty')
    .select('*')
    .or(`facultyName.ilike.%${facultySearchQuery}%,facultyId.ilike.%${facultySearchQuery}%`)

  if (error) {
    console.error(error)
    alert("Error searching faculty")
    return
  }

  if (data.length === 0) {
    alert("No faculty found")
    setFacultySearchResult(null)
  } else {
    setFacultySearchResult(data[0])
    setEditingFacultyIndex(data[0].id)
  }
}
const handleFacultyEdit = () => {
  if (facultySearchResult) {
    setFacultyForm({
      facultyName: facultySearchResult.facultyName,
      facultyId: facultySearchResult.facultyId,
      designation: facultySearchResult.designation,
      department: facultySearchResult.department,
      email: facultySearchResult.email,
      phone: facultySearchResult.phone,
      experience: facultySearchResult.experience || '',
      subjectsHandled: facultySearchResult.subjectsHandled || '',
      officeRoom: facultySearchResult.officeRoom || '',
      researchArea: facultySearchResult.researchArea || '',
      notes: facultySearchResult.notes || ''
    })

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }
}
const handleDeleteFaculty = async () => {
  if (editingFacultyIndex === null) {
    alert('Search a faculty first')
    return
  }

  const confirmDelete = window.confirm('Delete this faculty?')
  if (!confirmDelete) return

  const { error } = await supabase
    .from('faculty')
    .delete()
    .eq('id', editingFacultyIndex)

  if (error) {
    console.error(error)
    alert('Error deleting faculty')
    return
  }

  alert('Faculty deleted successfully!')

  setFacultySearchResult(null)
  setEditingFacultyIndex(null)
}
const renderSGPAFields = () => {
  const year = studentForm.year
  if (!year) return null

  let semCount = 0

  if (year === '1st Year') semCount = 2
  else if (year === '2nd Year') semCount = 4
  else if (year === '3rd Year') semCount = 6
  else if (year === '4th Year') semCount = 8

  return Array.from({ length: semCount }, (_, i) => (
    <input
      key={i}
      type="number"
      name={`sem${i + 1}`}
      placeholder={`Sem ${i + 1} SGPA`}
      value={studentForm[`sem${i + 1}`]}
      onChange={handleStudentChange}
    />
  ))
}
const calculateCGPA = () => {
  const values = Object.keys(studentForm)
    .filter(key => key.startsWith('sem') && studentForm[key])
    .map(key => Number(studentForm[key]))

  if (!values.length) return ''

  const sum = values.reduce((a, b) => a + b, 0)
  return (sum / values.length).toFixed(2)
}

const handleStudentSubmit = async (e) => {
  e.preventDefault()

  const studentData = {
    fullName: studentForm.fullName,
    usn: studentForm.usn,
    year: studentForm.year,
    branch: studentForm.branch,
    phone: studentForm.phone,
    email: studentForm.email,
    parentPhone: studentForm.parentPhone,
    address: studentForm.address,
    sem1: studentForm.sem1 || null,
    sem2: studentForm.sem2 || null,
    sem3: studentForm.sem3 || null,
    sem4: studentForm.sem4 || null,
    sem5: studentForm.sem5 || null,
    sem6: studentForm.sem6 || null,
    sem7: studentForm.sem7 || null,
    sem8: studentForm.sem8 || null,
    tenthMarks: studentForm.tenthMarks || null,
    twelvethMarks: studentForm.twelvethMarks || null,
    backlogs: studentForm.backlogs || null,
    achievements: studentForm.achievements
  }

  if (editingStudentIndex !== null) {
    const { error } = await supabase
      .from('students')
      .update(studentData)
      .eq('id', editingStudentIndex)

    if (error) {
      console.error(error)
      alert('Error updating student data')
      return
    }

    alert('Student updated successfully!')
  } else {
    const { error } = await supabase
      .from('students')
      .insert([studentData])

    if (error) {
      console.error(error)
      alert('Error saving student data')
      return
    }

    alert('Student saved successfully!')
  }

  setStudentForm({
    fullName: '',
    usn: '',
    year: '',
    branch: '',
    phone: '',
    email: '',
    parentPhone: '',
    address: '',
    sem1: '',
    sem2: '',
    sem3: '',
    sem4: '',
    sem5: '',
    sem6: '',
    sem7: '',
    sem8: '',
    tenthMarks: '',
    twelvethMarks: '',
    backlogs: '',
    achievements: ''
  })

  setSearchResult(null)
  setEditingStudentIndex(null)
}
const handleSearch = async () => {
  if (!searchQuery) {
    alert("Enter name or USN")
    return
  }

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .or(`fullName.ilike.%${searchQuery}%,usn.ilike.%${searchQuery}%`)

  if (error) {
    console.error(error)
    alert("Error searching student")
    return
  }

  if (data.length === 0) {
    alert("No student found")
    setSearchResult(null)
  } else {
    setSearchResult(data[0])
    setEditingStudentIndex(data[0].id)
  }
}
const handleEditStudent = () => {
  if (searchResult) {
    setStudentForm({
      fullName: searchResult.fullName,
      usn: searchResult.usn,
      year: searchResult.year,
      branch: searchResult.branch,
      phone: searchResult.phone,
      email: searchResult.email,
      parentPhone: searchResult.parentPhone,
      address: searchResult.address,
      sem1: searchResult.sem1 || '',
      sem2: searchResult.sem2 || '',
      sem3: searchResult.sem3 || '',
      sem4: searchResult.sem4 || '',
      sem5: searchResult.sem5 || '',
      sem6: searchResult.sem6 || '',
      sem7: searchResult.sem7 || '',
      sem8: searchResult.sem8 || '',
      tenthMarks: searchResult.tenthMarks || '',
      twelvethMarks: searchResult.twelvethMarks || '',
      backlogs: searchResult.backlogs || '',
      achievements: searchResult.achievements || ''
    })

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }
}
const handleDeleteStudent = async () => {
  if (editingStudentIndex === null) {
    alert('Search a student first')
    return
  }

  const confirmDelete = window.confirm('Are you sure you want to delete this student?')
  if (!confirmDelete) return

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', editingStudentIndex)

  if (error) {
    console.error(error)
    alert('Error deleting student')
    return
  }

  alert('Student deleted successfully!')

  setSearchResult(null)
  setEditingStudentIndex(null)
  setStudentForm({
    fullName: '',
    usn: '',
    year: '',
    branch: '',
    phone: '',
    email: '',
    parentPhone: '',
    address: '',
    sem1: '',
    sem2: '',
    sem3: '',
    sem4: '',
    sem5: '',
    sem6: '',
    sem7: '',
    sem8: '',
    tenthMarks: '',
    twelvethMarks: '',
    backlogs: '',
    achievements: ''
  })
}
const handleNoticeChange = (e) => {
  setNoticeForm({
    ...noticeForm,
    [e.target.name]: e.target.value
  })
}

const handleNoticeSubmit = async (e) => {
  e.preventDefault()

  const noticeData = {
    title: noticeForm.title,
    content: noticeForm.content,
    audience: noticeForm.audience,
    date: noticeForm.date
  }

  const { error } = await supabase
    .from('notices')
    .insert([noticeData])

  if (error) {
    console.error(error)
    alert('Error saving notice')
    return
  }

  alert('Notice added successfully!')

  setNoticeForm({
    title: '',
    content: '',
    audience: '',
    date: ''
  })

  fetchNotices()
}

const fetchNotices = async () => {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  setNotices(data)
}

const handleDeleteNotice = async (id) => {
  const confirmDelete = window.confirm('Delete this notice?')
  if (!confirmDelete) return

  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(error)
    alert('Error deleting notice')
    return
  }

  alert('Notice deleted successfully!')
  fetchNotices()
}
const fetchDashboardCounts = async () => {
  const { count: studentCount, error: studentError } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })

  const { count: facultyCount, error: facultyError } = await supabase
    .from('faculty')
    .select('*', { count: 'exact', head: true })

  const { count: noticeCount, error: noticeError } = await supabase
    .from('notices')
    .select('*', { count: 'exact', head: true })

  const { data: mentorData, error: mentorError } = await supabase
    .from('mentorMentee')
    .select('mentor')

  if (studentError || facultyError || noticeError || mentorError) {
    console.error(studentError || facultyError || noticeError || mentorError)
    return
  }

  const uniqueMentors = [...new Set((mentorData || []).map(item => item.mentor).filter(Boolean))]

  setDashboardCounts({
    students: studentCount || 0,
    faculty: facultyCount || 0,
    mentors: uniqueMentors.length,
    notices: noticeCount || 0
  })
}
const handleLogin = () => {
  if (!role) {
    alert('Please select a role')
    return
  }

  if (role === 'Mentor' && !loggedInMentor) {
    alert('Please select mentor name')
    return
  }

  setIsLoggedIn(true)

  if (role === 'Admin') {
    setActiveSection('Dashboard')
  } else if (role === 'Mentor') {
    setActiveSection('Mentor')
  }
}

const handleLogout = () => {
  setIsLoggedIn(false)
  setRole('')
  setLoggedInMentor('')
  setActiveSection('Dashboard')
}
const renderLoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="main-title">Department Utility Management System</h1>
        <p className="sub-title">Select your role to continue</p>

        <label>Select Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Choose Role</option>
          <option value="Admin">Admin</option>
          <option value="Mentor">Mentor</option>
        </select>

        {role === 'Mentor' && (
          <>
            <label>Select Mentor Name</label>
            <select
              value={loggedInMentor}
              onChange={(e) => setLoggedInMentor(e.target.value)}
            >
              <option value="">Choose Mentor</option>
              {mentorList.map((mentor, index) => (
  <option key={index} value={mentor}>
    {mentor}
  </option>
))}
            </select>
          </>
        )}

        <button className="submit-btn" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  )
}
const handleMenteeClick = async (studentUSN) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('usn', studentUSN)

  if (error) {
    console.error(error)
    alert('Error fetching mentee details')
    return
  }

  if (data.length > 0) {
    setSelectedMenteeProfile(data[0])
  } else {
    alert('Student details not found in database')
  }
}
const fetchMentorList = async () => {
  const { data, error } = await supabase
    .from('mentorMentee')
    .select('mentor')

  if (error) {
    console.error(error)
    return
  }

  const uniqueMentors = [...new Set(data.map((item) => item.mentor).filter(Boolean))]
  setMentorList(uniqueMentors)
}

const fetchMentorStudents = async (mentorName) => {
  const { data, error } = await supabase
    .from('mentorMentee')
    .select('*')
    .eq('mentor', mentorName)

  if (error) {
    console.error(error)
    alert('Error fetching mentor data')
    return
  }

  setMentorStudents(data || [])
}
const secondYearMentees = mentorStudents.filter(
  (student) => student.year && student.year.toLowerCase().includes('2nd')
)

const thirdYearMentees = mentorStudents.filter(
  (student) => student.year && student.year.toLowerCase().includes('3rd')
)

const fourthYearMentees = mentorStudents.filter(
  (student) => student.year && student.year.toLowerCase().includes('4th')
)
  const renderContent = () => {
    if (activeSection === 'Dashboard') {
  return (
    <div className="student-page">
      <div className="student-form-wrapper">
        <div className="student-form-card">
          <h1 className="main-title">Department Utility Management System</h1>
          <p className="sub-title">Dashboard Overview - ISE Department</p>

          <div className="search-bar-wrapper">
            <h2 className="section-heading" style={{ margin: 0 }}>System Summary</h2>
            <button type="button" onClick={fetchDashboardCounts} className="search-btn">
              Refresh Dashboard
            </button>
          </div>

          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Total Students</h3>
              <p>{dashboardCounts.students}</p>
            </div>

            <div className="dashboard-card">
              <h3>Total Faculty</h3>
              <p>{dashboardCounts.faculty}</p>
            </div>

            <div className="dashboard-card">
              <h3>Total Mentors</h3>
              <p>{dashboardCounts.mentors}</p>
            </div>

            <div className="dashboard-card">
              <h3>Total Notices</h3>
              <p>{dashboardCounts.notices}</p>
            </div>
          </div>

          <div className="section-divider"></div>

          <h2 className="section-heading">Quick Access</h2>

<div className="dashboard-actions">
  {role === 'Admin' && (
    <>
      <button
        type="button"
        className="search-btn"
        onClick={() => setActiveSection('Student')}
      >
        Student Management
      </button>

      <button
        type="button"
        className="search-btn"
        onClick={() => setActiveSection('Faculty')}
      >
        Faculty Management
      </button>
    </>
  )}

  <button
    type="button"
    className="search-btn"
    onClick={() => setActiveSection('Mentor')}
  >
    Mentor–Mentee
  </button>

  <button
    type="button"
    className="search-btn"
    onClick={() => {
      setActiveSection('Notices')
      fetchNotices()
    }}
  >
    Notices
  </button>
</div>
        </div>
      </div>
    </div>
  )
}
    if (activeSection === 'Student') {
      return (
        <div className="student-page">
          

          <div className="student-form-wrapper">
            <div className="student-form-card">
              <h1 className="main-title">Student Information Management System</h1>
               <p className="sub-title">Please fill in your details accurately</p>
              
<h2 classname="section-heading" style={{ marginBottom: "10px" }}>🔍 Search Existing Student</h2>
{/* 🔍 SEARCH BAR */}
<div classname="search-by-wrapper" style={{ marginBottom: "20px" }}>
  <input
    type="text"
    placeholder="Search by Name or USN"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)} classname="search-input"
  />

  <button type="button" onClick={handleSearch} classname="search-btn">
    Search
  </button>
</div>

{/* 🔍 SEARCH RESULT */}
{searchResult && (
  <div className="result-card">
    <h2 classname="section-heading">Student Details</h2>
    <p><b>Name:</b> {searchResult.fullName}</p>
    <p><b>USN:</b> {searchResult.usn}</p>
    <p><b>Year:</b> {searchResult.year}</p>
    <p><b>Branch:</b> {searchResult.branch}</p>
    <p><b>Email:</b> {searchResult.email}</p>
    <p><b>Phone:</b> {searchResult.phone}</p>
    <p><b>10th:</b> {searchResult.tenthMarks}</p>
    <p><b>12th:</b> {searchResult.twelvethMarks}</p>
    <p><b>Backlogs:</b> {searchResult.backlogs}</p>
    <p><b>Achievements:</b> {searchResult.achievements}</p>
  </div>
)}
<div className="action-buttons">
  <button type="button" onClick={handleEditStudent} className="submit-btn">
    Edit
  </button>

  <button type="button" onClick={handleDeleteStudent} className="submit-btn">
    Delete
  </button>
</div>
<div className="section-divider"></div>
<h2 classname="section-heading">Add New Student Record</h2>
<form className="student-form" onSubmit={handleStudentSubmit}>
<h3 className="sub-section-heading">Personal Information</h3>
                
               <input type="text" name="fullName" placeholder="Full Name"
              value={studentForm.fullName} onChange={handleStudentChange} />
              <input type="text" name="usn" placeholder="USN"
              value={studentForm.usn} onChange={handleStudentChange} />
                <select name="year" value={studentForm.year} onChange={handleStudentChange}>
                  <option>Select Year</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>

                <select name="branch" value={studentForm.branch} onChange={handleStudentChange}>
                  <option>ISE</option>
                  <option>Other</option>
                </select>
                <h3 className="sub-section-heading">Contact Information</h3>

                <input type="text" placeholder="Phone Number" />
                <input type="email" placeholder="Email Address" />
                <input type="text" placeholder="Parent Phone Number" />
                <textarea placeholder="Address" rows="4"></textarea>

                <h3 className="sub-section-heading">Academic Information</h3>

                <input type="number" name="tenthMarks" placeholder="10th Marks (%)"
                value={studentForm.tenthMarks} onChange={handleStudentChange} />

<input
  type="number"
  name="twelvethMarks"
  placeholder="12th / Diploma Marks (%)"
  value={studentForm.twelthMarks}
  onChange={handleStudentChange}
/>

{renderSGPAFields()}

<input
  type="text"
  value={calculateCGPA()}
  placeholder="CGPA (Auto Calculated)"
  readOnly
/>

<input
  type="number"
  name="backlogs"
  placeholder="Number of Backlogs"
  value={studentForm.backlogs}
  onChange={handleStudentChange}
/>

<h3 className="sub-section-heading">Additional Details</h3>

<textarea
  name="achievements"
  placeholder="Achievements / Certifications / Activities"
  rows="3"
  value={studentForm.achievements}
  onChange={handleStudentChange}
></textarea>

<label>Upload Profile Photo</label>
<input type="file" accept="image/*" />

<label>Upload Certificates (if any)</label>
<input type="file" />
                

                <button type="submit" className="submit-btn">
  {editingStudentIndex !== null ? "Update Student" : "Submit Information"}
</button>
              </form>
            </div>
          </div>
        </div>
      )
    }

   if (activeSection === 'Faculty') {
  return (
    <div className="student-page">
      <div className="student-form-wrapper">
        <div className="student-form-card">
          <h1 className="main-title">Faculty Management System</h1>
          <p className="sub-title">Manage department faculty details</p>

          <h2 className="section-heading"> 🔍 Search Existing Faculty</h2>

          <div className="search-bar-wrapper">
            <input
              type="text"
              placeholder="Search by Faculty Name or Faculty ID"
              value={facultySearchQuery}
              onChange={(e) => setFacultySearchQuery(e.target.value)}
              className="search-input"
            />

            <button
              type="button"
              onClick={handleFacultySearch}
              className="search-btn"
            >
              Search
            </button>
          </div>
<div className="action-buttons">
  <button type="button" onClick={handleFacultyEdit} className="submit-btn">
    Edit
  </button>

  <button type="button" onClick={handleDeleteFaculty} className="submit-btn">
    Delete
  </button>
</div>
          {facultySearchResult && (
            <div className="result-card">
              <h2 className="section-heading">Faculty Details</h2>
              <p><b>Name:</b> {facultySearchResult.facultyName}</p>
              <p><b>Faculty ID:</b> {facultySearchResult.facultyId}</p>
              <p><b>Designation:</b> {facultySearchResult.designation}</p>
              <p><b>Department:</b> {facultySearchResult.department}</p>
              <p><b>Email:</b> {facultySearchResult.email}</p>
              <p><b>Phone:</b> {facultySearchResult.phone}</p>
              <p><b>Experience:</b> {facultySearchResult.experience}</p>
              <p><b>Subjects Handled:</b> {facultySearchResult.subjectsHandled}</p>
              <p><b>Office Room:</b> {facultySearchResult.officeRoom}</p>
              <p><b>Research Area:</b> {facultySearchResult.researchArea}</p>
              <p><b>Notes:</b> {facultySearchResult.notes}</p>
            </div>
          )}

          <div className="section-divider"></div>

          <h2 className="section-heading">Add New Faculty Record</h2>

          <form className="student-form" onSubmit={handleFacultySubmit}>
            <h3 className="sub-section-heading">Faculty Information</h3>

            <input
              type="text"
              name="facultyName"
              placeholder="Faculty Name"
              value={facultyForm.facultyName}
              onChange={handleFacultyChange}
            />

            <input
              type="text"
              name="facultyId"
              value={facultyForm.facultyId}
              readOnly
            />

            <select
              name="designation"
              value={facultyForm.designation}
              onChange={handleFacultyChange}
            >
              <option value="">Select Designation</option>
              <option>Professor</option>
              <option>Associate Professor</option>
              <option>Assistant Professor</option>
              <option>Lecturer</option>
            </select>

            <select
              name="department"
              value={facultyForm.department}
              onChange={handleFacultyChange}
            >
              <option value="">Select Department</option>
              <option>ISE</option>
              <option>Other</option>
            </select>

            <h3 className="sub-section-heading">Contact Information</h3>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={facultyForm.email}
              onChange={handleFacultyChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={facultyForm.phone}
              onChange={handleFacultyChange}
            />

            <h3 className="sub-section-heading">Professional Details</h3>

            <input
              type="number"
              name="experience"
              placeholder="Years of Experience"
              value={facultyForm.experience}
              onChange={handleFacultyChange}
            />

            <input
              type="text"
              name="subjectsHandled"
              placeholder="Subjects Handled"
              value={facultyForm.subjectsHandled}
              onChange={handleFacultyChange}
            />

            <input
              type="text"
              name="officeRoom"
              placeholder="Office Room Number"
              value={facultyForm.officeRoom}
              onChange={handleFacultyChange}
            />

            <input
              type="text"
              name="researchArea"
              placeholder="Research Area"
              value={facultyForm.researchArea}
              onChange={handleFacultyChange}
            />

            <textarea
              name="notes"
              placeholder="Additional Notes"
              rows="3"
              value={facultyForm.notes}
              onChange={handleFacultyChange}
            ></textarea>

            <label>Upload Profile Photo</label>
            <input type="file" accept="image/*" />

            <label>Upload Qualification Certificate</label>
            <input type="file" />

            <button type="submit" className="submit-btn">
  {editingFacultyIndex !== null ? "Update Faculty" : "Submit Information"}
</button>
          </form>
        </div>
      </div>
    </div>
  )
}
  if (activeSection === 'Mentor') {
  const mentorToShow = role === 'Mentor' ? loggedInMentor : selectedMentor

  return (
    <div className="student-page">
      <div className="student-form-wrapper">
        <div className="student-form-card">
          <h1 className="main-title">Mentor–Mentee Management</h1>
          <p className="sub-title">View mentor-wise assigned students</p>

          {role === 'Admin' ? (
            <>
              <h2 className="section-heading">Select Mentor</h2>
              <select
                value={selectedMentor}
                onChange={(e) => {
                  const mentorName = e.target.value
                  setSelectedMentor(mentorName)
                  setSelectedMenteeProfile(null)
                  if (mentorName) fetchMentorStudents(mentorName)
                }}
              >
                <option value="">Select Faculty Mentor</option>
                {mentorList.map((mentor, index) => (
                  <option key={index} value={mentor}>
                    {mentor}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <h2 className="section-heading">Logged in as Mentor</h2>
              <div className="result-card">
                <p><b>Mentor:</b> {loggedInMentor}</p>
              </div>
            </>
          )}

          {mentorToShow && (
            <>
              <div className="section-divider"></div>

              <h2 className="section-heading">2nd Year Mentees</h2>
              <div className="result-card">
                {secondYearMentees.length > 0 ? (
                  secondYearMentees.map((student, index) => (
                    <p
                      key={index}
                      onClick={() => handleMenteeClick(student.usn)}
                      style={{ cursor: 'pointer' }}
                    >
                      <b>{student.usn}</b> - {student.studentName}
                    </p>
                  ))
                ) : (
                  <p>No 2nd year mentees</p>
                )}
              </div>

              <h2 className="section-heading">3rd Year Mentees</h2>
              <div className="result-card">
                {thirdYearMentees.length > 0 ? (
                  thirdYearMentees.map((student, index) => (
                    <p
                      key={index}
                      onClick={() => handleMenteeClick(student.usn)}
                      style={{ cursor: 'pointer' }}
                    >
                      <b>{student.usn}</b> - {student.studentName}
                    </p>
                  ))
                ) : (
                  <p>No 3rd year mentees</p>
                )}
              </div>

              <h2 className="section-heading">4th Year Mentees</h2>
              <div className="result-card">
                {fourthYearMentees.length > 0 ? (
                  fourthYearMentees.map((student, index) => (
                    <p
                      key={index}
                      onClick={() => handleMenteeClick(student.usn)}
                      style={{ cursor: 'pointer' }}
                    >
                      <b>{student.usn}</b> - {student.studentName}
                    </p>
                  ))
                ) : (
                  <p>No 4th year mentees</p>
                )}
              </div>

              {selectedMenteeProfile && (
                <>
                  <div className="section-divider"></div>

                  <h2 className="section-heading">Mentee Academic Summary</h2>

                  <div className="result-card">
                    <p><b>Name:</b> {selectedMenteeProfile.fullName}</p>
                    <p><b>USN:</b> {selectedMenteeProfile.usn}</p>
                    <p><b>Year:</b> {selectedMenteeProfile.year}</p>
                    <p><b>Branch:</b> {selectedMenteeProfile.branch}</p>
                    <p><b>10th Marks:</b> {selectedMenteeProfile.tenthMarks}</p>
                    <p><b>12th Marks:</b> {selectedMenteeProfile.twelfthMarks}</p>
                    <p><b>Sem 1:</b> {selectedMenteeProfile.sem1 || 'N/A'}</p>
                    <p><b>Sem 2:</b> {selectedMenteeProfile.sem2 || 'N/A'}</p>
                    <p><b>Sem 3:</b> {selectedMenteeProfile.sem3 || 'N/A'}</p>
                    <p><b>Sem 4:</b> {selectedMenteeProfile.sem4 || 'N/A'}</p>
                    <p><b>Sem 5:</b> {selectedMenteeProfile.sem5 || 'N/A'}</p>
                    <p><b>Sem 6:</b> {selectedMenteeProfile.sem6 || 'N/A'}</p>
                    <p><b>Sem 7:</b> {selectedMenteeProfile.sem7 || 'N/A'}</p>
                    <p><b>Sem 8:</b> {selectedMenteeProfile.sem8 || 'N/A'}</p>
                    <p><b>Backlogs:</b> {selectedMenteeProfile.backlogs}</p>
                    <p><b>Achievements:</b> {selectedMenteeProfile.achievements}</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
if (activeSection === 'Notices') {
  return (
    <div className="student-page">
      <div className="student-form-wrapper">
        <div className="student-form-card">
          <h1 className="main-title">Notices Management</h1>
          <p className="sub-title">Create and manage department notices</p>

          <h2 className="section-heading">Add New Notice</h2>

          <form className="student-form" onSubmit={handleNoticeSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Notice Title"
              value={noticeForm.title}
              onChange={handleNoticeChange}
              required
            />

            <textarea
              name="content"
              placeholder="Notice Content"
              rows="4"
              value={noticeForm.content}
              onChange={handleNoticeChange}
              required
            ></textarea>

            <select
              name="audience"
              value={noticeForm.audience}
              onChange={handleNoticeChange}
              required
            >
              <option value="">Select Audience</option>
              <option>All</option>
              <option>Students</option>
              <option>Faculty</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>

            <input
              type="date"
              name="date"
              value={noticeForm.date}
              onChange={handleNoticeChange}
              required
            />

            <button type="submit" className="submit-btn">
              Add Notice
            </button>
          </form>

          <div className="section-divider"></div>

          <div className="search-bar-wrapper">
            <h2 className="section-heading" style={{ margin: 0 }}>All Notices</h2>
            <button type="button" onClick={fetchNotices} className="search-btn">
              Refresh Notices
            </button>
          </div>

          {notices.length > 0 ? (
            notices.map((notice) => (
              <div key={notice.id} className="result-card">
                <h3>{notice.title}</h3>
                <p><b>Audience:</b> {notice.audience}</p>
                <p><b>Date:</b> {notice.date}</p>
                <p>{notice.content}</p>

                <div className="action-buttons">
                  <button
                    type="button"
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="submit-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No notices added yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
  }

 return (
  <>
    {!isLoggedIn ? (
      renderLoginPage()
    ) : (
      <div className="app-container">
        <aside className="sidebar">
          <h2 className="logo">DUMS</h2>

          {role === 'Admin' && (
            <>
              <button
                className={`nav-button ${activeSection === 'Dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('Dashboard')
                  fetchDashboardCounts()
                }}
              >
                Dashboard
              </button>

              <button
                className={`nav-button ${activeSection === 'Student' ? 'active' : ''}`}
                onClick={() => setActiveSection('Student')}
              >
                Student
              </button>

              <button
                className={`nav-button ${activeSection === 'Faculty' ? 'active' : ''}`}
                onClick={() => setActiveSection('Faculty')}
              >
                Faculty
              </button>

              <button
                className={`nav-button ${activeSection === 'Mentor' ? 'active' : ''}`}
                onClick={() => setActiveSection('Mentor')}
              >
                Mentor-Mentee
              </button>

              <button
                className={`nav-button ${activeSection === 'Notices' ? 'active' : ''}`}
                onClick={() => setActiveSection('Notices')}
              >
                Notices
              </button>
            </>
          )}

          {role === 'Mentor' && (
  <>
    <button
      className={`nav-button ${activeSection === 'Dashboard' ? 'active' : ''}`}
      onClick={() => {
        setActiveSection('Dashboard')
        fetchDashboardCounts()
      }}
    >
      Dashboard
    </button>

    <button
      className={`nav-button ${activeSection === 'Mentor' ? 'active' : ''}`}
      onClick={() => setActiveSection('Mentor')}
    >
      Mentor-Mentee
    </button>

    <button
      className={`nav-button ${activeSection === 'Notices' ? 'active' : ''}`}
      onClick={() => setActiveSection('Notices')}
    >
      Notices
    </button>
  </>
)}

          <button className="nav-button" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <div className="main-section">
          <main className="content full-content">
            {renderContent()}
          </main>
        </div>
      </div>
    )}
  </>
)
}

export default App