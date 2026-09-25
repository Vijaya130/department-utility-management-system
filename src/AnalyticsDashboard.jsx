
import { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabase'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler
} from 'chart.js'

import { Line, Bar, Doughnut, Pie, Chart } from 'react-chartjs-2'

import {
  MatrixController,
  MatrixElement
} from 'chartjs-chart-matrix'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler,
  MatrixController,
  MatrixElement
)

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const COLORS = [
  '#1565c0',
  '#42a5f5',
  '#00897b',
  '#ff7043',
  '#ab47bc',
  '#ffca28',
  '#26a69a',
  '#ec407a'
]

const CHART_TYPES = [
  'Line',
  'Bar',
  'Pie',
  'Doughnut',
  'Heatmap'
]

const CATEGORIES = [
  'Attendance',
  'Academics',
  'Certificates',
  'Placements'
]

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 600
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    },
    tooltip: {
      enabled: true
    }
  }
}

const axisOptions = {
  ...chartOptions,
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#e3eeff'
      }
    }
  }
}

// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        flex: '1 1 150px',
        padding: 20,
        background: '#fff',
        borderRadius: 14,
        border: `1px solid ${color}55`,
        boxShadow: '0 3px 12px rgba(0,0,0,0.05)'
      }}
    >
      <p
        style={{
          color: '#78909c',
          fontSize: 13,
          margin: '0 0 8px'
        }}
      >
        {label}
      </p>

      <h2
        style={{
          color,
          margin: 0,
          fontSize: 26,
          fontWeight: 800
        }}
      >
        {value}
      </h2>
    </div>
  )
}

// --------------------------------------------------
// CHART RENDERER
// --------------------------------------------------

function ChartRenderer({ data, chartType, category }) {
  if (
    !data ||
    !data.labels?.length ||
    (
      chartType !== 'Heatmap' &&
      !data.datasets?.length
    )
  ) {
    return (
      <div
        style={{
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#78909c',
          textAlign: 'center',
          padding: 20
        }}
      >
        <h3>No records available</h3>

        <p>
          Add actual {category.toLowerCase()} records
          for this student in Supabase.
        </p>
      </div>
    )
  }

  // HEATMAP
  if (chartType === 'Heatmap') {
    if (!data.heatmap?.length) {
      return (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h3>No attendance data available</h3>
          <p>
            Add subject-wise attendance records to display
            the heatmap.
          </p>
        </div>
      )
    }

    const heatmapData = {
      datasets: [
        {
          label: 'Attendance %',
          data: data.heatmap,

          backgroundColor: (ctx) => {
            const value = ctx.raw?.v ?? 0

            if (value >= 85) return '#2e7d32'
            if (value >= 75) return '#8bc34a'
            if (value >= 60) return '#ffca28'

            return '#e53935'
          },

          borderColor: '#ffffff',
          borderWidth: 3,

          width: ({ chart }) => {
            const area = chart.chartArea

            if (!area) return 25

            return Math.max(
              15,
              area.width /
                Math.max(data.heatmapColumns.length, 1) - 8
            )
          },

          height: ({ chart }) => {
            const area = chart.chartArea

            if (!area) return 25

            return Math.max(
              15,
              area.height /
                Math.max(data.heatmapRows.length, 1) - 8
            )
          }
        }
      ]
    }

    const heatmapOptions = {
      ...chartOptions,

      scales: {
        x: {
          type: 'category',
          labels: data.heatmapColumns,
          offset: true,

          title: {
            display: true,
            text: 'Semester'
          },

          grid: {
            display: false
          }
        },

        y: {
          type: 'category',
          labels: data.heatmapRows,
          offset: true,
          reverse: true,

          title: {
            display: true,
            text: 'Subject'
          },

          grid: {
            display: false
          }
        }
      },

      plugins: {
        ...chartOptions.plugins,

        legend: {
          display: false
        },

        tooltip: {
          callbacks: {
            title: (items) => {
              const point = items[0]?.raw

              return point
                ? `${point.subject} — ${point.semester}`
                : ''
            },

            label: (item) => {
              const point = item.raw

              return `${point.v}% attendance`
            }
          }
        }
      }
    }

    return (
      <div
        style={{
          width: '100%',
          height: Math.max(
            350,
            data.heatmapRows.length * 45
          )
        }}
      >
        <Chart
          type="matrix"
          data={heatmapData}
          options={{
            ...heatmapOptions,
            responsive: true,
            maintainAspectRatio: false
          }}
        />
      </div>
    )
  }

  // LINE CHART
  if (chartType === 'Line') {
    return (
      <div style={{ height: 400, width: '100%' }}>
        <Line
          data={data}
          options={axisOptions}
        />
      </div>
    )
  }

  // BAR CHART
  if (chartType === 'Bar') {
    return (
      <div style={{ height: 400, width: '100%' }}>
        <Bar
          data={data}
          options={axisOptions}
        />
      </div>
    )
  }

  // PIE CHART
  if (chartType === 'Pie') {
    return (
      <div style={{ height: 400, width: '100%' }}>
        <Pie
          data={data}
          options={{
            ...chartOptions,
            maintainAspectRatio: false
          }}
        />
      </div>
    )
  }

  // DOUGHNUT CHART
  if (chartType === 'Doughnut') {
    return (
      <div style={{ height: 400, width: '100%' }}>
        <Doughnut
          data={data}
          options={{
            ...chartOptions,
            maintainAspectRatio: false
          }}
        />
      </div>
    )
  }

  return null
}

// --------------------------------------------------
// MAIN ANALYTICS DASHBOARD
// --------------------------------------------------

export default function AnalyticsDashboard() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)

  const [attendance, setAttendance] = useState([])
  const [certificates, setCertificates] = useState([])
  const [placements, setPlacements] = useState([])

  const [category, setCategory] = useState('')
  const [chartType, setChartType] = useState('Bar')

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState('')

  // ------------------------------------------------
  // FETCH STUDENTS
  // ------------------------------------------------

  useEffect(() => {
    let active = true

    const fetchStudents = async () => {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('fullName', { ascending: true })

      if (!active) return

      if (error) {
        console.error('Student fetch error:', error)

        setError(
          'Unable to load students: ' + error.message
        )

        setStudents([])
      } else {
        setStudents(data || [])
      }

      setLoading(false)
    }

    fetchStudents()

    return () => {
      active = false
    }
  }, [])

  // ------------------------------------------------
  // FETCH SELECTED STUDENT RECORDS
  // ------------------------------------------------

  useEffect(() => {
    let active = true

    if (!selectedStudent?.usn) {
      setAttendance([])
      setCertificates([])
      setPlacements([])
      setDataLoading(false)
      return
    }

    const fetchStudentData = async () => {
      setDataLoading(true)
      setError('')

      const usn = selectedStudent.usn

      const [
        attendanceResult,
        certificateResult,
        placementResult
      ] = await Promise.all([
        supabase
          .from('attendance')
          .select('*')
          .eq('usn', usn)
          .order('semester', { ascending: true }),

        supabase
          .from('certificates')
          .select('*')
          .eq('usn', usn)
          .order('created_at', { ascending: false }),

        supabase
          .from('placements')
          .select('*')
          .eq('usn', usn)
          .order('placement_year', { ascending: false })
      ])

      if (!active) return

      const errors = [
        attendanceResult.error,
        certificateResult.error,
        placementResult.error
      ].filter(Boolean)

      if (errors.length) {
        console.error('Student records fetch error:', errors)

        setError(
          errors.map(e => e.message).join(' | ')
        )
      }

      setAttendance(attendanceResult.data || [])
      setCertificates(certificateResult.data || [])
      setPlacements(placementResult.data || [])

      setDataLoading(false)
    }

    fetchStudentData()

    return () => {
      active = false
    }
  }, [selectedStudent])

  // ------------------------------------------------
  // SEARCH STUDENTS
  // ------------------------------------------------

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim()

    return students.filter(student =>
      student.fullName?.toLowerCase().includes(q) ||
      student.usn?.toLowerCase().includes(q)
    )
  }, [students, search])

  // ------------------------------------------------
  // ACADEMIC DATA
  // ------------------------------------------------

  const academicData = useMemo(() => {
    if (!selectedStudent) return []

    const student = selectedStudent

    const entries = [
      { label: 'Sem 1', value: student.sem1 },
      { label: 'Sem 2', value: student.sem2 },
      { label: 'Sem 3', value: student.sem3 },
      { label: 'Sem 4', value: student.sem4 },
      { label: 'Sem 5', value: student.sem5 },
      { label: 'Sem 6', value: student.sem6 },
      { label: 'Sem 7', value: student.sem7 },
      { label: 'Sem 8', value: student.sem8 }
    ]

    return entries
      .filter(item =>
        item.value !== null &&
        item.value !== undefined &&
        String(item.value).trim() !== '' &&
        Number.isFinite(Number(item.value)) &&
        Number(item.value) > 0
      )
      .map(item => ({
        label: item.label,
        value: Number(item.value)
      }))
  }, [selectedStudent])

  // ------------------------------------------------
  // ATTENDANCE DATA
  // ------------------------------------------------

  const attendanceData = useMemo(() => {
    return attendance.map(record => {
      const attended =
        Number(record.classes_attended) || 0

      const total =
        Number(record.total_classes) || 0

      return {
        label: `${record.subject_code || record.subject_name} (${record.semester})`,
        subject: record.subject_name || record.subject_code || 'Unknown',
        semester: record.semester,
        attended,
        total,
        value: total > 0
          ? Number(
              ((attended / total) * 100).toFixed(2)
            )
          : 0
      }
    })
  }, [attendance])

  // ------------------------------------------------
  // AVERAGE ATTENDANCE
  // ------------------------------------------------

  const averageAttendance = useMemo(() => {
    const totalClasses = attendance.reduce(
      (sum, row) =>
        sum + (Number(row.total_classes) || 0),
      0
    )

    const attendedClasses = attendance.reduce(
      (sum, row) =>
        sum + (Number(row.classes_attended) || 0),
      0
    )

    return totalClasses
      ? ((attendedClasses / totalClasses) * 100).toFixed(2)
      : '—'
  }, [attendance])

  // ------------------------------------------------
  // AVERAGE SGPA
  // ------------------------------------------------

  const avgSGPA = useMemo(() => {
    if (!selectedStudent) return '—'

    const values = [
      selectedStudent.sem1,
      selectedStudent.sem2,
      selectedStudent.sem3,
      selectedStudent.sem4,
      selectedStudent.sem5,
      selectedStudent.sem6,
      selectedStudent.sem7,
      selectedStudent.sem8
    ]
      .filter(value =>
        value !== null &&
        value !== undefined &&
        value !== ''
      )
      .map(Number)
      .filter(value =>
        Number.isFinite(value) &&
        value > 0
      )

    return values.length
      ? (
          values.reduce((sum, value) => sum + value, 0) /
          values.length
        ).toFixed(2)
      : '—'
  }, [selectedStudent])

  // ------------------------------------------------
  // BUILD CHART DATA
  // ------------------------------------------------

  const chartData = useMemo(() => {
    if (!selectedStudent || !category) {
      return null
    }

    // ATTENDANCE
    if (category === 'Attendance') {
      if (!attendanceData.length) return null

      if (chartType === 'Heatmap') {
        const subjects = [
          ...new Set(
            attendanceData.map(row => row.subject)
          )
        ]

        const semesters = [
          ...new Set(
            attendanceData.map(row => row.semester)
          )
        ]

        const heatmap = attendanceData.map(row => ({
          x: semesters.indexOf(row.semester),
          y: subjects.indexOf(row.subject),
          v: row.value,
          subject: row.subject,
          semester: row.semester
        }))

        return {
          labels: semesters,
          datasets: [],
          heatmap,
          heatmapRows: subjects,
          heatmapColumns: semesters
        }
      }

      return {
        labels: attendanceData.map(row => row.label),

        datasets: [
          {
            label: 'Attendance %',
            data: attendanceData.map(row => row.value),
            backgroundColor: COLORS,
            borderColor: '#1565c0',
            borderWidth: 2,
            fill: chartType === 'Line',
            tension: 0.35
          }
        ]
      }
    }

    // ACADEMICS
    if (category === 'Academics') {
      if (!academicData.length) return null

      return {
        labels: academicData.map(row => row.label),

        datasets: [
          {
            label: 'SGPA',
            data: academicData.map(row => row.value),
            backgroundColor: COLORS,
            borderColor: '#1565c0',
            borderWidth: 3,
            fill: chartType === 'Line',
            tension: 0.3
          }
        ]
      }
    }

    // CERTIFICATES
    if (category === 'Certificates') {
      if (!certificates.length) return null

      const counts = {}

      certificates.forEach(cert => {
        const name = cert.category || 'Uncategorized'

        counts[name] = (counts[name] || 0) + 1
      })

      return {
        labels: Object.keys(counts),

        datasets: [
          {
            label: 'Certificates',
            data: Object.values(counts),
            backgroundColor: COLORS,
            borderColor: '#fff',
            borderWidth: 2
          }
        ]
      }
    }

    // PLACEMENTS
    if (category === 'Placements') {
      if (!placements.length) return null

      const counts = {}

      placements.forEach(placement => {
        const name = placement.company || 'Unknown'

        counts[name] = (counts[name] || 0) + 1
      })

      return {
        labels: Object.keys(counts),

        datasets: [
          {
            label: 'Placement Records',
            data: Object.values(counts),
            backgroundColor: COLORS,
            borderColor: '#fff',
            borderWidth: 2
          }
        ]
      }
    }

    return null
  }, [
    selectedStudent,
    category,
    chartType,
    attendanceData,
    academicData,
    certificates,
    placements
  ])

  // ------------------------------------------------
  // HANDLERS
  // ------------------------------------------------

  const handleStudentSelect = student => {
    setSelectedStudent(student)
    setCategory('')
    setChartType('Bar')
    setSearch('')
    setError('')
  }

  const handleCategorySelect = cat => {
    setCategory(cat)

    setChartType(
      cat === 'Attendance'
        ? 'Heatmap'
        : 'Bar'
    )
  }

  const certificateCount = certificates.length

  // ------------------------------------------------
  // MAIN UI
  // ------------------------------------------------

  return (
    <div className="student-page">
      <div className="student-form-wrapper">
        <div
          className="student-form-card"
          style={{
            maxWidth: 1100,
            width: '100%',
            margin: '0 auto'
          }}
        >
          <h1
            className="main-title"
            style={{ textAlign: 'center' }}
          >
            Analytics Dashboard
          </h1>

          <p
            className="sub-title"
            style={{ textAlign: 'center' }}
          >
            Student performance, subject-wise attendance,
            certificates and placements
          </p>

          {/* STUDENT SELECTION */}

          <section style={{ marginTop: 30 }}>
            <h2 className="section-heading">
              1. Select Student
            </h2>

            {loading ? (
              <p style={{ padding: 20 }}>
                Loading students...
              </p>
            ) : error && !students.length ? (
              <p style={{ color: 'red' }}>
                {error}
              </p>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search student by name or USN..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 14,
                    borderRadius: 10,
                    border: '1px solid #bbdefb',
                    marginBottom: 16,
                    boxSizing: 'border-box'
                  }}
                />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 12,
                    maxHeight: 280,
                    overflowY: 'auto'
                  }}
                >
                  {filteredStudents.map(student => (
                    <button
                      key={student.usn}
                      onClick={() =>
                        handleStudentSelect(student)
                      }
                      style={{
                        padding: 18,
                        textAlign: 'left',
                        borderRadius: 12,

                        border:
                          selectedStudent?.usn === student.usn
                            ? '2px solid #1565c0'
                            : '1px solid #dbeafe',

                        background:
                          selectedStudent?.usn === student.usn
                            ? '#e8f0fe'
                            : '#fff',

                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ color: '#1a237e' }}>
                        {student.fullName || student.usn}
                      </strong>

                      <p
                        style={{
                          margin: '5px 0 0',
                          fontSize: 13
                        }}
                      >
                        {student.usn}
                      </p>

                      <p
                        style={{
                          margin: '5px 0 0',
                          fontSize: 12
                        }}
                      >
                        {student.year || 'Year not entered'}
                      </p>
                    </button>
                  ))}
                </div>

                {!filteredStudents.length && (
                  <p>No students match your search.</p>
                )}
              </>
            )}
          </section>

          {/* SELECTED STUDENT SUMMARY */}

          {selectedStudent && (
            <>
              <section
                style={{
                  marginTop: 28,
                  padding: 24,
                  borderRadius: 16,
                  background: '#e8f0fe'
                }}
              >
                <h2
                  style={{
                    color: '#1a237e',
                    marginTop: 0
                  }}
                >
                  {selectedStudent.fullName}
                </h2>

                <p>
                  USN: {selectedStudent.usn} |
                  Branch: {selectedStudent.branch || '—'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 14,
                    marginTop: 20
                  }}
                >
                  <StatCard
                    label="Average SGPA"
                    value={avgSGPA}
                    color="#1565c0"
                  />

                  <StatCard
                    label="Backlogs"
                    value={selectedStudent.backlogs ?? 0}
                    color="#e53935"
                  />

                  <StatCard
                    label="Certificates"
                    value={certificateCount}
                    color="#00897b"
                  />

                  <StatCard
                    label="Attendance"
                    value={
                      averageAttendance === '—'
                        ? '—'
                        : `${averageAttendance}%`
                    }
                    color="#8e24aa"
                  />
                </div>
              </section>

              {/* CATEGORY SELECTION */}

              <section style={{ marginTop: 30 }}>
                <h2 className="section-heading">
                  2. Select Category
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 12
                  }}
                >
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() =>
                        handleCategorySelect(cat)
                      }
                      style={{
                        padding: 20,
                        borderRadius: 12,

                        border:
                          category === cat
                            ? '2px solid #1565c0'
                            : '1px solid #dbeafe',

                        background:
                          category === cat
                            ? '#1565c0'
                            : '#fff',

                        color:
                          category === cat
                            ? '#fff'
                            : '#37474f',

                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>

              {/* CHART SELECTION */}

              {category && (
                <section style={{ marginTop: 30 }}>
                  <h2 className="section-heading">
                    3. Choose Visualization
                  </h2>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    {CHART_TYPES
                      .filter(type =>
                        type !== 'Heatmap' ||
                        category === 'Attendance'
                      )
                      .map(type => (
                        <button
                          key={type}
                          onClick={() => setChartType(type)}
                          style={{
                            padding: '14px 24px',
                            borderRadius: 10,

                            border:
                              chartType === type
                                ? '2px solid #1565c0'
                                : '1px solid #dbeafe',

                            background:
                              chartType === type
                                ? '#1565c0'
                                : '#fff',

                            color:
                              chartType === type
                                ? '#fff'
                                : '#37474f',

                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {type === 'Heatmap'
                            ? 'Heatmap'
                            : `${type} Chart`}
                        </button>
                      ))}
                  </div>
                </section>
              )}

              {/* CHART AND RECORDS */}

              {category && (
                <section
                  style={{
                    marginTop: 30,
                    padding: 24,
                    background: '#fff',
                    border: '1px solid #dbeafe',
                    borderRadius: 16,
                    boxShadow: '0 4px 18px rgba(0,0,0,0.05)'
                  }}
                >
                  <h2 style={{ color: '#1a237e' }}>
                    {category} Analytics
                  </h2>

                  <p style={{ color: '#78909c' }}>
                    {selectedStudent.fullName} — {chartType}
                  </p>

                  {dataLoading ? (
                    <div
                      style={{
                        padding: 60,
                        textAlign: 'center'
                      }}
                    >
                      Loading database records...
                    </div>
                  ) : error ? (
                    <div
                      style={{
                        color: 'red',
                        padding: 20
                      }}
                    >
                      {error}
                    </div>
                  ) : (
                    <ChartRenderer
                      data={chartData}
                      chartType={chartType}
                      category={category}
                    />
                  )}

                  {/* ATTENDANCE TABLE */}

                  {!dataLoading &&
                    category === 'Attendance' && (
                      <div
                        style={{
                          marginTop: 30,
                          overflowX: 'auto'
                        }}
                      >
                        <h3>Subject-wise Attendance</h3>

                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                          }}
                        >
                          <thead>
                            <tr style={{ background: '#e8f0fe' }}>
                              <th style={{ padding: 12, textAlign: 'left' }}>
                                Subject
                              </th>
                              <th style={{ padding: 12 }}>
                                Semester
                              </th>
                              <th style={{ padding: 12 }}>
                                Attended
                              </th>
                              <th style={{ padding: 12 }}>
                                Total
                              </th>
                              <th style={{ padding: 12 }}>
                                Attendance %
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {attendanceData.map((row, i) => (
                              <tr
                                key={`${row.label}-${i}`}
                                style={{
                                  borderBottom: '1px solid #e3eeff',
                                  textAlign: 'center'
                                }}
                              >
                                <td
                                  style={{
                                    padding: 12,
                                    textAlign: 'left'
                                  }}
                                >
                                  {row.subject}
                                </td>

                                <td style={{ padding: 12 }}>
                                  {row.semester}
                                </td>

                                <td style={{ padding: 12 }}>
                                  {row.attended}
                                </td>

                                <td style={{ padding: 12 }}>
                                  {row.total}
                                </td>

                                <td
                                  style={{
                                    padding: 12,
                                    fontWeight: 700
                                  }}
                                >
                                  {row.value}%
                                </td>
                              </tr>
                            ))}

                            {!attendanceData.length && (
                              <tr>
                                <td
                                  colSpan="5"
                                  style={{ padding: 20 }}
                                >
                                  No attendance records found
                                  for this student.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                  {/* PLACEMENT TABLE */}

                  {!dataLoading &&
                    category === 'Placements' && (
                      <div
                        style={{
                          marginTop: 30,
                          overflowX: 'auto'
                        }}
                      >
                        <h3>Placement Records</h3>

                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                          }}
                        >
                          <thead>
                            <tr style={{ background: '#e8f0fe' }}>
                              <th style={{ padding: 12 }}>
                                Company
                              </th>
                              <th style={{ padding: 12 }}>
                                Package
                              </th>
                              <th style={{ padding: 12 }}>
                                Year
                              </th>
                              <th style={{ padding: 12 }}>
                                Status
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {placements.map((row, i) => (
                              <tr
                                key={row.id ?? i}
                                style={{ textAlign: 'center' }}
                              >
                                <td style={{ padding: 12 }}>
                                  {row.company || '—'}
                                </td>

                                <td style={{ padding: 12 }}>
                                  {row.package || '—'}
                                </td>

                                <td style={{ padding: 12 }}>
                                  {row.placement_year || '—'}
                                </td>

                                <td style={{ padding: 12 }}>
                                  {row.status || '—'}
                                </td>
                              </tr>
                            ))}

                            {!placements.length && (
                              <tr>
                                <td
                                  colSpan="4"
                                  style={{ padding: 20 }}
                                >
                                  No placement records found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                  {/* CERTIFICATE TABLE */}

                  {!dataLoading &&
                    category === 'Certificates' && (
                      <div
                        style={{
                          marginTop: 30,
                          overflowX: 'auto'
                        }}
                      >
                        <h3>Certificate Records</h3>

                        <table
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                          }}
                        >
                          <thead>
                            <tr style={{ background: '#e8f0fe' }}>
                              <th style={{ padding: 12 }}>
                                Certificate
                              </th>
                              <th style={{ padding: 12 }}>
                                Category
                              </th>
                              <th style={{ padding: 12 }}>
                                Organization
                              </th>
                              <th style={{ padding: 12 }}>
                                Issue Date
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {certificates.map((row, i) => (
                              <tr
                                key={row.id ?? i}
                                style={{ textAlign: 'center' }}
                              >
                                <td style={{ padding: 12 }}>
                                  {row.certificate_name || '—'}
                                </td>

                                <td style={{ padding: 12 }}>
                                  {row.category || '—'}
                                </td>

                                <td style={{ padding: 12 }}>
                                  {row.issuing_organization || '—'}
                                </td>

                                <td style={{ padding: 12 }}>
                                  {row.issue_date || '—'}
                                </td>
                              </tr>
                            ))}

                            {!certificates.length && (
                              <tr>
                                <td
                                  colSpan="4"
                                  style={{ padding: 20 }}
                                >
                                  No certificate records found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}