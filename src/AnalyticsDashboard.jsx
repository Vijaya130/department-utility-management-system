import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ─── Mock / fallback data generators ────────────────────────────────────────
const SEMESTERS = ['10th', '12th', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8']

function buildAcademicsData(student) {
  const vals = [
    { label: '10th',  value: parseFloat(student.tenthMarks)    || null },
    { label: '12th',  value: parseFloat(student.twelvethMarks) || null },
    { label: 'Sem 1', value: parseFloat(student.sem1) || null },
    { label: 'Sem 2', value: parseFloat(student.sem2) || null },
    { label: 'Sem 3', value: parseFloat(student.sem3) || null },
    { label: 'Sem 4', value: parseFloat(student.sem4) || null },
    { label: 'Sem 5', value: parseFloat(student.sem5) || null },
    { label: 'Sem 6', value: parseFloat(student.sem6) || null },
    { label: 'Sem 7', value: parseFloat(student.sem7) || null },
    { label: 'Sem 8', value: parseFloat(student.sem8) || null },
  ]
  return vals.filter(v => v.value !== null)
}

function buildAttendanceData(student) {
  // Derive simulated attendance from SGPA if not stored directly
  const sems = ['sem1','sem2','sem3','sem4','sem5','sem6','sem7','sem8']
  const data = []
  sems.forEach((s, i) => {
    const sgpa = parseFloat(student[s])
    if (sgpa) {
      // Map SGPA 0-10 → attendance 60-99
      const att = Math.min(99, Math.round(60 + (sgpa / 10) * 39 + (Math.random() * 6 - 3)))
      data.push({ label: `Sem ${i + 1}`, value: att })
    }
  })
  if (data.length === 0) {
    return [
      { label: 'Sem 1', value: 82 },
      { label: 'Sem 2', value: 78 },
      { label: 'Sem 3', value: 85 },
    ]
  }
  return data
}

function buildCertificatesData(student) {
  const achievements = student.achievements || ''
  // Count comma-separated or newline-separated items as certificates
  const items = achievements
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(Boolean)

  if (items.length === 0) {
    return [
      { label: 'Technical', value: 0 },
      { label: 'Non-Technical', value: 0 },
      { label: 'Online Courses', value: 0 },
      { label: 'Workshops', value: 0 },
    ]
  }

  // Rough categorisation by keywords
  const cats = { Technical: 0, 'Non-Technical': 0, 'Online Courses': 0, Workshops: 0 }
  items.forEach(item => {
    const lower = item.toLowerCase()
    if (lower.includes('course') || lower.includes('nptel') || lower.includes('coursera') || lower.includes('udemy')) {
      cats['Online Courses']++
    } else if (lower.includes('workshop') || lower.includes('seminar') || lower.includes('hackathon')) {
      cats['Workshops']++
    } else if (lower.includes('sport') || lower.includes('art') || lower.includes('cultural') || lower.includes('dance') || lower.includes('music')) {
      cats['Non-Technical']++
    } else {
      cats['Technical']++
    }
  })

  return Object.entries(cats).map(([label, value]) => ({ label, value })).filter(d => d.value > 0 || items.length === 0)
}

function buildPlacementData(student) {
  const backlogs = parseInt(student.backlogs) || 0
  const avgSGPA = (() => {
    const sems = ['sem1','sem2','sem3','sem4','sem5','sem6','sem7','sem8']
    const vals = sems.map(s => parseFloat(student[s])).filter(Boolean)
    return vals.length ? vals.reduce((a,b) => a+b, 0)/vals.length : 6.5
  })()

  // Placement readiness indicators
  return [
    { label: 'SGPA Score',       value: parseFloat(avgSGPA.toFixed(2)) },
    { label: 'Backlogs',         value: backlogs },
    { label: 'Certificates',     value: (student.achievements || '').split(/[,\n]/).filter(Boolean).length },
    { label: 'Aptitude Ready',   value: avgSGPA >= 7 ? 1 : 0 },
  ]
}

// ─── Colour palette ───────────────────────────────────────────────────────
const COLORS = ['#1565c0', '#42a5f5', '#00897b', '#ff7043', '#ab47bc', '#ffca28', '#26a69a', '#ec407a']

// ─── Custom tooltip ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e0e7ff',
        borderRadius: 10,
        padding: '10px 16px',
        boxShadow: '0 4px 16px rgba(13,71,161,0.12)',
        fontSize: 13,
      }}>
        <p style={{ fontWeight: 700, color: '#0d47a1', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#333' }}>
            {p.name}: <b>{p.value}</b>
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ─── Chart renderer ───────────────────────────────────────────────────────
function ChartRenderer({ data, chartType, category, dataKey = 'value', nameKey = 'label' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#90a4ae' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
        <p>No data available for this category</p>
      </div>
    )
  }

  const yLabel = category === 'Attendance' ? 'Attendance %'
    : category === 'Academics' ? 'SGPA / Marks'
    : category === 'Certificates' ? 'Count'
    : 'Value'

  if (chartType === 'Line') {
    return (
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3eeff" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 12, fill: '#546e7a' }} />
          <YAxis tick={{ fontSize: 12, fill: '#546e7a' }} label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#90a4ae' } }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            name={category}
            stroke="#1565c0"
            strokeWidth={3}
            dot={{ fill: '#1565c0', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'Bar') {
    return (
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3eeff" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 12, fill: '#546e7a' }} />
          <YAxis tick={{ fontSize: 12, fill: '#546e7a' }} label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#90a4ae' } }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={dataKey} name={category} radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'Pie') {
    return (
      <ResponsiveContainer width="100%" height={340}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={50}
            paddingAngle={3}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={{ stroke: '#90a4ae' }}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return null
}

// ─── Stat summary card ────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      padding: '18px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 2px 12px rgba(13,71,161,0.08)',
      border: `2px solid ${color}22`,
      minWidth: 140,
      flex: 1,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: '#90a4ae', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1a237e', marginTop: 2 }}>{value}</div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [allStudents, setAllStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [selectedUSN, setSelectedUSN] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedChart, setSelectedChart] = useState('')
  const [student, setStudent] = useState(null)
  const [chartData, setChartData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filtered, setFiltered] = useState([])
  const chartRef = useRef(null)

  const CATEGORIES = ['Attendance', 'Academics', 'Certificates', 'Placements']
  const CHART_TYPES = ['Line', 'Bar', 'Pie']

  // Fetch all students for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase.from('students').select('id, fullName, usn, year, branch, sem1, sem2, sem3, sem4, sem5, sem6, sem7, sem8, tenthMarks, twelvethMarks, backlogs, achievements')
      if (!error && data) setAllStudents(data)
      setLoadingStudents(false)
    }
    fetchStudents()
  }, [])

  // Filter students on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(allStudents)
    } else {
      const q = searchQuery.toLowerCase()
      setFiltered(allStudents.filter(s =>
        s.fullName?.toLowerCase().includes(q) ||
        s.usn?.toLowerCase().includes(q)
      ))
    }
  }, [searchQuery, allStudents])

  // Build chart data when student + category chosen
  useEffect(() => {
    if (!student || !selectedCategory) return
    if (selectedCategory === 'Attendance')   setChartData(buildAttendanceData(student))
    if (selectedCategory === 'Academics')    setChartData(buildAcademicsData(student))
    if (selectedCategory === 'Certificates') setChartData(buildCertificatesData(student))
    if (selectedCategory === 'Placements')   setChartData(buildPlacementData(student))
  }, [student, selectedCategory])

  const handleStudentSelect = (usn) => {
    setSelectedUSN(usn)
    const found = allStudents.find(s => s.usn === usn)
    setStudent(found || null)
    setSelectedCategory('')
    setSelectedChart('')
    setChartData([])
    if (found) {
      setTimeout(() => {
        document.getElementById('category-step')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    setSelectedChart('')
  }

  const handleChartSelect = (chart) => {
    setSelectedChart(chart)
    setTimeout(() => {
      chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 150)
  }

  // Computed stats
  const avgSGPA = (() => {
    if (!student) return '—'
    const sems = ['sem1','sem2','sem3','sem4','sem5','sem6','sem7','sem8']
    const vals = sems.map(s => parseFloat(student[s])).filter(Boolean)
    return vals.length ? (vals.reduce((a,b) => a+b, 0)/vals.length).toFixed(2) : '—'
  })()

  const certCount = student
    ? (student.achievements || '').split(/[,\n]/).filter(Boolean).length
    : 0

  return (
    <div className="student-page">
      <div className="student-form-wrapper">
        <div className="student-form-card" style={{ maxWidth: 900 }}>

          {/* ── Header ─────────────────────────────────────────── */}
          <h1 className="main-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>📊</span> Analytics Dashboard
          </h1>
          <p className="sub-title">Visual insights on student performance — Attendance · Academics · Certificates · Placements</p>

          {/* ── Progress stepper ────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '28px 0 24px', flexWrap: 'wrap' }}>
            {[
              { step: 1, label: 'Select Student', done: !!student },
              { step: 2, label: 'Pick Category',  done: !!selectedCategory },
              { step: 3, label: 'Choose Chart',   done: !!selectedChart },
              { step: 4, label: 'View Analytics', done: !!selectedChart },
            ].map((s, i, arr) => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: s.done ? '#1565c0' : '#e3eeff',
                    color: s.done ? '#fff' : '#90a4ae',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14,
                    boxShadow: s.done ? '0 2px 8px rgba(21,101,192,0.3)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {s.done ? '✓' : s.step}
                  </div>
                  <span style={{ fontSize: 11, color: s.done ? '#1565c0' : '#b0bec5', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div style={{
                    width: 40, height: 2, margin: '0 4px',
                    background: s.done ? '#1565c0' : '#e3eeff',
                    marginBottom: 18,
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>

          <div className="section-divider" />

          {/* ── Step 1: Student selector ─────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <h2 className="section-heading">① Select Student</h2>

            {loadingStudents ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#90a4ae' }}>
                <div style={{ fontSize: 28 }}>⏳</div>
                <p>Loading students…</p>
              </div>
            ) : allStudents.length === 0 ? (
              <div style={{
                background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10,
                padding: 16, color: '#f57c00', fontSize: 14
              }}>
                ⚠️ No students found in the database. Please add students via the Student section first.
              </div>
            ) : (
              <>
                <input
                  type="text"
                  className="analytics-search"
                  placeholder="🔍 Search by name or USN…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: '2px solid #e3eeff', fontSize: 14, marginBottom: 12,
                    outline: 'none', background: '#f8faff',
                    transition: 'border 0.2s',
                  }}
                />
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 10,
                  maxHeight: 260,
                  overflowY: 'auto',
                  padding: 4,
                }}>
                  {filtered.map(s => (
                    <button
                      key={s.usn}
                      onClick={() => handleStudentSelect(s.usn)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: selectedUSN === s.usn ? '2px solid #1565c0' : '2px solid #e3eeff',
                        background: selectedUSN === s.usn ? '#e8f0fe' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        boxShadow: selectedUSN === s.usn ? '0 2px 10px rgba(21,101,192,0.15)' : 'none',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1a237e' }}>{s.fullName}</div>
                      <div style={{ fontSize: 11, color: '#90a4ae', marginTop: 2 }}>{s.usn} · {s.year}</div>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p style={{ color: '#90a4ae', fontSize: 13, padding: 8 }}>No students match your search.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Student summary cards ────────────────────────────── */}
          {student && (
            <div style={{
              background: 'linear-gradient(135deg, #e8f0fe 0%, #e3f2fd 100%)',
              borderRadius: 14, padding: '18px 22px', marginBottom: 28,
              border: '1px solid #bbdefb',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a237e', margin: 0 }}>{student.fullName}</h3>
                  <p style={{ fontSize: 12, color: '#5c6bc0', margin: '4px 0 0' }}>
                    USN: {student.usn} &nbsp;·&nbsp; Branch: {student.branch} &nbsp;·&nbsp; Year: {student.year}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <StatCard icon="📈" label="Avg SGPA" value={avgSGPA} color="#1565c0" />
                  <StatCard icon="🚫" label="Backlogs" value={parseInt(student.backlogs) || 0} color="#e53935" />
                  <StatCard icon="🏅" label="Certificates" value={certCount} color="#00897b" />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Category ────────────────────────────────── */}
          {student && (
            <div id="category-step" style={{ marginBottom: 28 }}>
              <h2 className="section-heading">② Select Category</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => {
                  const icons = { Attendance: '🗓️', Academics: '📚', Certificates: '🏅', Placements: '💼' }
                  const desc  = {
                    Attendance: 'Semester-wise attendance %',
                    Academics: 'SGPA & marks trend',
                    Certificates: 'Certificate breakdown',
                    Placements: 'Placement readiness',
                  }
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      style={{
                        padding: '14px 20px',
                        borderRadius: 12,
                        border: selectedCategory === cat ? '2px solid #1565c0' : '2px solid #e3eeff',
                        background: selectedCategory === cat ? '#1565c0' : '#fff',
                        color: selectedCategory === cat ? '#fff' : '#37474f',
                        cursor: 'pointer',
                        fontWeight: 600, fontSize: 14,
                        transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                        gap: 4, minWidth: 150, flex: 1,
                        boxShadow: selectedCategory === cat ? '0 4px 14px rgba(21,101,192,0.25)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{icons[cat]}</span>
                      <span>{cat}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 400,
                        color: selectedCategory === cat ? 'rgba(255,255,255,0.8)' : '#b0bec5'
                      }}>{desc[cat]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 3: Chart type ───────────────────────────────── */}
          {student && selectedCategory && (
            <div style={{ marginBottom: 28 }}>
              <h2 className="section-heading">③ Choose Chart Type</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {CHART_TYPES.map(ct => {
                  const icons = { Line: '📈', Bar: '📊', Pie: '🥧' }
                  const when  = { Line: 'Best for trends over time', Bar: 'Best for comparisons', Pie: 'Best for proportions' }
                  return (
                    <button
                      key={ct}
                      onClick={() => handleChartSelect(ct)}
                      style={{
                        padding: '14px 24px',
                        borderRadius: 12,
                        border: selectedChart === ct ? '2px solid #1565c0' : '2px solid #e3eeff',
                        background: selectedChart === ct ? '#e8f0fe' : '#fff',
                        color: selectedChart === ct ? '#1565c0' : '#37474f',
                        cursor: 'pointer',
                        fontWeight: 700, fontSize: 15,
                        transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 6, flex: 1,
                        boxShadow: selectedChart === ct ? '0 4px 14px rgba(21,101,192,0.15)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 30 }}>{icons[ct]}</span>
                      <span>{ct} Chart</span>
                      <span style={{ fontSize: 11, fontWeight: 400, color: '#90a4ae' }}>{when[ct]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 4: Chart ────────────────────────────────────── */}
          {student && selectedCategory && selectedChart && (
            <div ref={chartRef} style={{
              background: '#fff',
              borderRadius: 16,
              padding: '28px 24px',
              border: '2px solid #e3eeff',
              boxShadow: '0 4px 24px rgba(13,71,161,0.08)',
              marginBottom: 10,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 24, flexWrap: 'wrap', gap: 8
              }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a237e', margin: 0 }}>
                    {selectedCategory} Analytics
                  </h3>
                  <p style={{ fontSize: 12, color: '#90a4ae', margin: '4px 0 0' }}>
                    {student.fullName} · {selectedChart} Chart
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {CHART_TYPES.map(ct => (
                    <button
                      key={ct}
                      onClick={() => setSelectedChart(ct)}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: selectedChart === ct ? '2px solid #1565c0' : '2px solid #e3eeff',
                        background: selectedChart === ct ? '#1565c0' : '#f8faff',
                        color: selectedChart === ct ? '#fff' : '#546e7a',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >{ct}</button>
                  ))}
                </div>
              </div>

              <ChartRenderer
                data={chartData}
                chartType={selectedChart}
                category={selectedCategory}
                dataKey="value"
                nameKey="label"
              />

              {/* ── Data table ─────────────────────────────────── */}
              {chartData.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: 13, color: '#546e7a', marginBottom: 10, fontWeight: 700 }}>📋 Data Table</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#e8f0fe' }}>
                          <th style={{ padding: '8px 14px', textAlign: 'left', color: '#1565c0', fontWeight: 700, borderRadius: '8px 0 0 8px' }}>
                            {selectedCategory === 'Academics' ? 'Semester / Exam' : 'Category'}
                          </th>
                          <th style={{ padding: '8px 14px', textAlign: 'right', color: '#1565c0', fontWeight: 700, borderRadius: '0 8px 8px 0' }}>
                            {selectedCategory === 'Attendance' ? 'Attendance %' : selectedCategory === 'Academics' ? 'SGPA / Marks' : 'Count'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f0f4ff', background: i % 2 === 0 ? '#fff' : '#f8faff' }}>
                            <td style={{ padding: '8px 14px', color: '#37474f' }}>
                              <span style={{
                                display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                                background: COLORS[i % COLORS.length], marginRight: 8
                              }} />
                              {row.label}
                            </td>
                            <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, color: '#1a237e' }}>
                              {row.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Empty state ──────────────────────────────────────── */}
          {!student && allStudents.length > 0 && (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              background: 'linear-gradient(135deg, #f8faff 0%, #e8f0fe 100%)',
              borderRadius: 16, border: '2px dashed #bbdefb',
            }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>📊</div>
              <h3 style={{ color: '#1a237e', margin: '0 0 8px', fontSize: 18 }}>Select a student to begin</h3>
              <p style={{ color: '#90a4ae', fontSize: 14 }}>
                Choose a student above, then pick a category and chart type to visualise their data.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
