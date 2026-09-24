<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// ─── Colors ──────────────────────────────────────────────────────────────────
const COLORS = ['#1565c0','#42a5f5','#00897b','#ff7043','#ab47bc','#ffca28','#26a69a','#ec407a']

// ─── Data builders ────────────────────────────────────────────────────────────
function buildAcademicsData(s) {
  const raw = [
    { label:'10th',  value: parseFloat(s.tenthMarks) },
    { label:'12th',  value: parseFloat(s.twelvethMarks) },
    { label:'Sem 1', value: parseFloat(s.sem1) },
    { label:'Sem 2', value: parseFloat(s.sem2) },
    { label:'Sem 3', value: parseFloat(s.sem3) },
    { label:'Sem 4', value: parseFloat(s.sem4) },
    { label:'Sem 5', value: parseFloat(s.sem5) },
    { label:'Sem 6', value: parseFloat(s.sem6) },
    { label:'Sem 7', value: parseFloat(s.sem7) },
    { label:'Sem 8', value: parseFloat(s.sem8) },
  ]
  return raw.filter(d => d.value && !isNaN(d.value))
}

function buildAttendanceData(s) {
  const sems = ['sem1','sem2','sem3','sem4','sem5','sem6','sem7','sem8']
  const data = []
  sems.forEach((k, i) => {
    const v = parseFloat(s[k])
    if (v) data.push({ label:`Sem ${i+1}`, value: Math.min(99, Math.round(60 + (v/10)*35)) })
  })
  return data.length ? data : [
    { label:'Sem 1', value:82 },{ label:'Sem 2', value:78 },{ label:'Sem 3', value:85 }
  ]
}

function buildCertificatesData(s) {
  const items = (s.achievements||'').split(/[,\n]/).map(x=>x.trim()).filter(Boolean)
  if (!items.length) return [
    { label:'Technical', value:0 },{ label:'Non-Technical', value:0 },
    { label:'Online Courses', value:0 },{ label:'Workshops', value:0 }
  ]
  const cats = { Technical:0, 'Non-Technical':0, 'Online Courses':0, Workshops:0 }
  items.forEach(item => {
    const l = item.toLowerCase()
    if (l.includes('course')||l.includes('nptel')||l.includes('coursera')||l.includes('udemy')) cats['Online Courses']++
    else if (l.includes('workshop')||l.includes('seminar')||l.includes('hackathon')) cats['Workshops']++
    else if (l.includes('sport')||l.includes('art')||l.includes('cultural')||l.includes('dance')||l.includes('music')) cats['Non-Technical']++
    else cats['Technical']++
  })
  return Object.entries(cats).map(([label,value])=>({label,value})).filter(d=>d.value>0)
}

function buildPlacementData(s) {
  const sems = ['sem1','sem2','sem3','sem4','sem5','sem6','sem7','sem8']
  const vals = sems.map(k=>parseFloat(s[k])).filter(Boolean)
  const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0
  const certs = (s.achievements||'').split(/[,\n]/).filter(Boolean).length
  return [
    { label:'Avg SGPA', value: parseFloat(avg.toFixed(2)) },
    { label:'Backlogs', value: parseInt(s.backlogs)||0 },
    { label:'Certificates', value: certs },
    { label:'Aptitude Ready', value: avg>=7?1:0 },
  ]
}

// ─── Pure SVG Line Chart ──────────────────────────────────────────────────────
function LineChart({ data }) {
  const W=520, H=260, PL=48, PR=20, PT=20, PB=48
  const iW=W-PL-PR, iH=H-PT-PB
  const vals = data.map(d=>d.value)
  const minV = Math.min(...vals), maxV = Math.max(...vals)
  const range = maxV-minV || 1
  const px = (i) => PL + (i/(data.length-1||1))*iW
  const py = (v) => PT + iH - ((v-minV)/range)*iH
  const points = data.map((d,i)=>`${px(i)},${py(d.value)}`).join(' ')
  const ticks = 5
  const yTicks = Array.from({length:ticks+1},(_,i)=>minV+(range/ticks)*i)
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:'visible'}}>
      {yTicks.map((t,i)=>(
        <g key={i}>
          <line x1={PL} y1={py(t)} x2={W-PR} y2={py(t)} stroke="#e3eeff" strokeWidth="1"/>
          <text x={PL-6} y={py(t)+4} textAnchor="end" fontSize="10" fill="#90a4ae">{t.toFixed(1)}</text>
        </g>
      ))}
      <polygon points={`${px(0)},${PT+iH} ${points} ${px(data.length-1)},${PT+iH}`} fill="#1565c020"/>
      <polyline points={points} fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinejoin="round"/>
      {data.map((d,i)=>(
        <g key={i}>
          <circle cx={px(i)} cy={py(d.value)} r="5" fill="#1565c0" stroke="#fff" strokeWidth="2"/>
          <text x={px(i)} y={H-PB+16} textAnchor="middle" fontSize="10" fill="#546e7a">{d.label}</text>
          <text x={px(i)} y={py(d.value)-10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1565c0">{d.value}</text>
        </g>
      ))}
      <line x1={PL} y1={PT} x2={PL} y2={PT+iH} stroke="#cfd8dc" strokeWidth="1.5"/>
      <line x1={PL} y1={PT+iH} x2={W-PR} y2={PT+iH} stroke="#cfd8dc" strokeWidth="1.5"/>
    </svg>
  )
}

// ─── Pure SVG Bar Chart ───────────────────────────────────────────────────────
function BarChart({ data }) {
  const W=520, H=260, PL=48, PR=20, PT=20, PB=48
  const iW=W-PL-PR, iH=H-PT-PB
  const maxV = Math.max(...data.map(d=>d.value),1)
  const barW = Math.min(48, (iW/data.length)*0.6)
  const gap = iW/data.length
  const ticks = 5
  const yTicks = Array.from({length:ticks+1},(_,i)=>(maxV/ticks)*i)
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:'visible'}}>
      {yTicks.map((t,i)=>(
        <g key={i}>
          <line x1={PL} y1={PT+iH-(t/maxV)*iH} x2={W-PR} y2={PT+iH-(t/maxV)*iH} stroke="#e3eeff" strokeWidth="1"/>
          <text x={PL-6} y={PT+iH-(t/maxV)*iH+4} textAnchor="end" fontSize="10" fill="#90a4ae">{t.toFixed(1)}</text>
        </g>
      ))}
      {data.map((d,i)=>{
        const bH = (d.value/maxV)*iH
        const bX = PL + gap*i + gap/2 - barW/2
        const bY = PT+iH-bH
        return (
          <g key={i}>
            <rect x={bX} y={bY} width={barW} height={bH} fill={COLORS[i%COLORS.length]} rx="5"/>
            <text x={bX+barW/2} y={bY-6} textAnchor="middle" fontSize="10" fontWeight="700" fill={COLORS[i%COLORS.length]}>{d.value}</text>
            <text x={bX+barW/2} y={PT+iH+16} textAnchor="middle" fontSize="10" fill="#546e7a">{d.label}</text>
          </g>
        )
      })}
      <line x1={PL} y1={PT} x2={PL} y2={PT+iH} stroke="#cfd8dc" strokeWidth="1.5"/>
      <line x1={PL} y1={PT+iH} x2={W-PR} y2={PT+iH} stroke="#cfd8dc" strokeWidth="1.5"/>
    </svg>
  )
}

// ─── Pure SVG Pie Chart ───────────────────────────────────────────────────────
function PieChart({ data }) {
  const W=420, H=280, CX=160, CY=130, R=100, IR=45
  const total = data.reduce((a,d)=>a+d.value,0)||1
  let angle = -Math.PI/2
  const slices = data.map((d,i)=>{
    const sweep = (d.value/total)*2*Math.PI
    const x1=CX+R*Math.cos(angle), y1=CY+R*Math.sin(angle)
    const x2=CX+R*Math.cos(angle+sweep), y2=CY+R*Math.sin(angle+sweep)
    const ix1=CX+IR*Math.cos(angle), iy1=CY+IR*Math.sin(angle)
    const ix2=CX+IR*Math.cos(angle+sweep), iy2=CY+IR*Math.sin(angle+sweep)
    const large=sweep>Math.PI?1:0
    const midA=angle+sweep/2
    const lx=CX+(R+22)*Math.cos(midA), ly=CY+(R+22)*Math.sin(midA)
    const path=`M${ix1},${iy1} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${ix2},${iy2} A${IR},${IR} 0 ${large} 0 ${ix1},${iy1} Z`
    angle+=sweep
    return { path, color:COLORS[i%COLORS.length], label:d.label, value:d.value, pct:((d.value/total)*100).toFixed(0), lx, ly }
  })
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:'visible'}}>
      {slices.map((s,i)=>(
        <g key={i}>
          <path d={s.path} fill={s.color} stroke="#fff" strokeWidth="2"/>
          {parseFloat(s.pct)>5&&(
            <text x={s.lx} y={s.ly} textAnchor="middle" fontSize="10" fontWeight="700" fill={s.color}>{s.pct}%</text>
          )}
        </g>
      ))}
      {slices.map((s,i)=>(
        <g key={i} transform={`translate(${W-140},${20+i*22})`}>
          <rect width="12" height="12" rx="3" fill={s.color}/>
          <text x="18" y="10" fontSize="11" fill="#546e7a">{s.label} ({s.value})</text>
        </g>
      ))}
    </svg>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background:'#fff',borderRadius:14,padding:'16px 20px',
      display:'flex',alignItems:'center',gap:14,
      boxShadow:'0 2px 12px rgba(13,71,161,0.08)',
      border:`2px solid ${color}22`,flex:1,minWidth:120,
    }}>
      <div style={{width:42,height:42,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{icon}</div>
      <div>
        <div style={{fontSize:10,color:'#90a4ae',fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>{label}</div>
        <div style={{fontSize:20,fontWeight:800,color:'#1a237e',marginTop:2}}>{value}</div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [allStudents, setAllStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUSN, setSelectedUSN] = useState('')
  const [student, setStudent] = useState(null)
  const [category, setCategory] = useState('')
  const [chartType, setChartType] = useState('')
  const [chartData, setChartData] = useState([])

  const CATEGORIES = [
    { id:'Attendance',   icon:'🗓️', desc:'Semester-wise attendance %' },
    { id:'Academics',    icon:'📚', desc:'SGPA & marks trend' },
    { id:'Certificates', icon:'🏅', desc:'Certificate breakdown' },
    { id:'Placements',   icon:'💼', desc:'Placement readiness' },
  ]
  const CHART_TYPES = [
    { id:'Bar',  icon:'📊', desc:'Compare values' },
    { id:'Line', icon:'📈', desc:'Show trends' },
    { id:'Pie',  icon:'🥧', desc:'Show proportions' },
  ]

  useEffect(()=>{
    supabase.from('students').select('*').then(({data})=>{
      if(data) setAllStudents(data)
      setLoading(false)
    })
  },[])

  useEffect(()=>{
    if(!student||!category) return
    if(category==='Attendance')   setChartData(buildAttendanceData(student))
    if(category==='Academics')    setChartData(buildAcademicsData(student))
    if(category==='Certificates') setChartData(buildCertificatesData(student))
    if(category==='Placements')   setChartData(buildPlacementData(student))
  },[student,category])

  const filtered = allStudents.filter(s=>
    !search.trim()||
    s.fullName?.toLowerCase().includes(search.toLowerCase())||
    s.usn?.toLowerCase().includes(search.toLowerCase())
  )

  const selectStudent = (s) => {
    setSelectedUSN(s.usn); setStudent(s); setCategory(''); setChartType(''); setChartData([])
  }

  const avgSGPA = (()=>{
    if(!student) return '—'
    const vals=['sem1','sem2','sem3','sem4','sem5','sem6','sem7','sem8'].map(k=>parseFloat(student[k])).filter(Boolean)
    return vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2):'—'
  })()

  const certCount = student?(student.achievements||'').split(/[,\n]/).filter(Boolean).length:0

  const renderChart = () => {
    if(!chartData.length) return <div style={{textAlign:'center',padding:'40px 0',color:'#90a4ae'}}><div style={{fontSize:40}}>📭</div><p>No data available</p></div>
    if(chartType==='Line') return <LineChart data={chartData}/>
    if(chartType==='Bar')  return <BarChart data={chartData}/>
    if(chartType==='Pie')  return <PieChart data={chartData}/>
    return null
  }
=======

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

import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'

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

const CHART_TYPES = ['Line', 'Bar', 'Pie', 'Doughnut', 'Heatmap']

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

function StatCard({ label, value, icon, color }) {
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
      <div style={{ fontSize: 24 }}>{icon}</div>

      <p
        style={{
          color: '#78909c',
          fontSize: 13,
          margin: '8px 0'
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

function ChartRenderer({
  data,
  chartType,
  category
}) {
  if (!data || !data.labels?.length || !data.datasets?.length) {
    return (
      <div
        style={{
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#78909c',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: 48 }}>📊</div>

        <h3>No records available</h3>

        <p>
          Add actual {category.toLowerCase()} records
          for this student in Supabase.
        </p>
      </div>
    )
  }

  if (chartType === 'Heatmap') {
    if (!data.heatmap) {
      return (
        <p style={{ textAlign: 'center', padding: 40 }}>
          Heatmap is available for subject-wise attendance.
        </p>
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
              area.width / Math.max(data.heatmapColumns.length, 1) - 8
            )
          },
          height: ({ chart }) => {
            const area = chart.chartArea

            if (!area) return 25

            return Math.max(
              15,
              area.height / Math.max(data.heatmapRows.length, 1) - 8
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
      <div style={{ width: '100%', height: 420 }}>
        <Bar
          data={{
            labels: data.heatmapColumns,
            datasets: []
          }}
          options={{
            ...chartOptions,
            plugins: {
              legend: { display: false }
            }
          }}
          hidden
        />

        <div style={{ width: '100%', height: '100%' }}>
          {/*
            Matrix chart is rendered directly through ChartJS
            to keep the heatmap responsive.
          */}
          <MatrixChart
            data={heatmapData}
            options={heatmapOptions}
          />
        </div>
      </div>
    )
  }

  if (chartType === 'Line') {
    return (
      <div style={{ height: 400, width: '100%' }}>
        <Line data={data} options={axisOptions} />
      </div>
    )
  }

  if (chartType === 'Bar') {
    return (
      <div style={{ height: 400, width: '100%' }}>
        <Bar data={data} options={axisOptions} />
      </div>
    )
  }

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

// Chart.js matrix controller wrapper
import { Chart } from 'react-chartjs-2'

function MatrixChart({ data, options }) {
  return (
    <Chart
      type="matrix"
      data={data}
      options={{
        ...options,
        responsive: true,
        maintainAspectRatio: false
      }}
    />
  )
}

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

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('fullName', { ascending: true })

      if (error) {
        console.error(error)
        setError('Unable to load students: ' + error.message)
      } else {
        setStudents(data || [])
      }

      setLoading(false)
    }

    fetchStudents()
  }, [])

  // Fetch selected student's real database records
  useEffect(() => {
    if (!selectedStudent) return

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

      const errors = [
        attendanceResult.error,
        certificateResult.error,
        placementResult.error
      ].filter(Boolean)

      if (errors.length) {
        console.error(errors)
        setError(errors.map(e => e.message).join(' | '))
      }

      setAttendance(attendanceResult.data || [])
      setCertificates(certificateResult.data || [])
      setPlacements(placementResult.data || [])

      setDataLoading(false)
    }

    fetchStudentData()
  }, [selectedStudent])

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim()

    return students.filter(student =>
      student.fullName?.toLowerCase().includes(q) ||
      student.usn?.toLowerCase().includes(q)
    )
  }, [students, search])

  // Academics from actual student records
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

  // Actual attendance percentages, one record per subject/semester
  const attendanceData = useMemo(() => {
    return attendance.map(record => ({
      label: `${record.subject_code} (${record.semester})`,
      subject: record.subject_name,
      semester: record.semester,
      attended: record.classes_attended,
      total: record.total_classes,
      value: record.total_classes > 0
        ? Number(
            (
              record.classes_attended /
              record.total_classes *
              100
            ).toFixed(2)
          )
        : 0
    }))
  }, [attendance])

  const averageAttendance = useMemo(() => {
    const totalClasses = attendance.reduce(
      (sum, row) => sum + (Number(row.total_classes) || 0),
      0
    )

    const attendedClasses = attendance.reduce(
      (sum, row) => sum + (Number(row.classes_attended) || 0),
      0
    )

    return totalClasses
      ? ((attendedClasses / totalClasses) * 100).toFixed(2)
      : '—'
  }, [attendance])

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
      .filter(value => Number.isFinite(value))

    return values.length
      ? (
          values.reduce((sum, value) => sum + value, 0) /
          values.length
        ).toFixed(2)
      : '—'
  }, [selectedStudent])

  // Build the chart data based on selected category
  const chartData = useMemo(() => {
    if (!selectedStudent || !category) return null

    if (category === 'Attendance') {
      if (!attendanceData.length) return null

      if (chartType === 'Heatmap') {
        const subjects = [
          ...new Set(attendanceData.map(row => row.subject))
        ]

        const semesters = [
          ...new Set(attendanceData.map(row => row.semester))
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

    if (category === 'Academics') {
      if (!academicData.length) return null

      return {
        labels: academicData.map(row => row.label),
        datasets: [
          {
            label: 'Marks / SGPA',
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

  const handleStudentSelect = student => {
    setSelectedStudent(student)
    setCategory('')
    setChartType('Bar')
    setSearch('')
  }

  const handleCategorySelect = cat => {
    setCategory(cat)
    setChartType(cat === 'Attendance' ? 'Heatmap' : 'Bar')
  }

  const certificateCount = certificates.length
>>>>>>> 623e29e (Update HOD dashboard and analytics)

  return (
    <div className="student-page">
      <div className="student-form-wrapper">
<<<<<<< HEAD
        <div className="student-form-card" style={{maxWidth:860}}>
          <h1 className="main-title">📊 Analytics Dashboard</h1>
          <p className="sub-title">Visual insights · Attendance · Academics · Certificates · Placements</p>

          <div style={{display:'flex',alignItems:'center',margin:'24px 0',flexWrap:'wrap',gap:4}}>
            {[{n:1,label:'Student',done:!!student},{n:2,label:'Category',done:!!category},{n:3,label:'Chart',done:!!chartType},{n:4,label:'View',done:!!chartType}].map((s,i,arr)=>(
              <div key={s.n} style={{display:'flex',alignItems:'center'}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:s.done?'#1565c0':'#e3eeff',color:s.done?'#fff':'#90a4ae',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,boxShadow:s.done?'0 2px 8px rgba(21,101,192,0.3)':'none'}}>{s.done?'✓':s.n}</div>
                  <span style={{fontSize:10,color:s.done?'#1565c0':'#b0bec5',fontWeight:600}}>{s.label}</span>
                </div>
                {i<arr.length-1&&<div style={{width:36,height:2,margin:'0 4px 18px',background:s.done?'#1565c0':'#e3eeff'}}/>}
              </div>
            ))}
          </div>

          <div className="section-divider"/>

          {/* Step 1 */}
          <div style={{marginBottom:28}}>
            <h2 className="section-heading">① Select Student</h2>
            {loading?<p style={{color:'#90a4ae',textAlign:'center',padding:24}}>⏳ Loading…</p>:allStudents.length===0?(
              <div style={{background:'#fff8e1',border:'1px solid #ffe082',borderRadius:10,padding:16,color:'#f57c00',fontSize:14}}>⚠️ No students found. Add students first.</div>
            ):(
              <>
                <input type="text" placeholder="🔍 Search by name or USN…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'2px solid #e3eeff',fontSize:14,marginBottom:12,outline:'none',background:'#f8faff',boxSizing:'border-box'}}/>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8,maxHeight:240,overflowY:'auto',padding:2}}>
                  {filtered.map(s=>(
                    <button key={s.usn} onClick={()=>selectStudent(s)} style={{padding:'11px 14px',borderRadius:10,cursor:'pointer',textAlign:'left',border:selectedUSN===s.usn?'2px solid #1565c0':'2px solid #e3eeff',background:selectedUSN===s.usn?'#e8f0fe':'#fff',boxShadow:selectedUSN===s.usn?'0 2px 10px rgba(21,101,192,0.15)':'none',transition:'all 0.2s'}}>
                      <div style={{fontWeight:700,fontSize:13,color:'#1a237e'}}>{s.fullName}</div>
                      <div style={{fontSize:11,color:'#90a4ae',marginTop:2}}>{s.usn} · {s.year}</div>
                    </button>
                  ))}
                  {filtered.length===0&&<p style={{color:'#90a4ae',fontSize:13}}>No students match.</p>}
=======
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
              ① Select Student
            </h2>

            {loading ? (
              <p>Loading students...</p>
            ) : error && !students.length ? (
              <p style={{ color: 'red' }}>{error}</p>
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
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      style={{
                        padding: 18,
                        textAlign: 'left',
                        borderRadius: 12,
                        border: selectedStudent?.id === student.id
                          ? '2px solid #1565c0'
                          : '1px solid #dbeafe',
                        background: selectedStudent?.id === student.id
                          ? '#e8f0fe'
                          : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ color: '#1a237e' }}>
                        {student.fullName || student.usn}
                      </strong>

                      <p style={{ margin: '5px 0 0', fontSize: 13 }}>
                        {student.usn}
                      </p>

                      <p style={{ margin: '5px 0 0', fontSize: 12 }}>
                        {student.year || 'Year not entered'}
                      </p>
                    </button>
                  ))}
>>>>>>> 623e29e (Update HOD dashboard and analytics)
                </div>

                {!filteredStudents.length && (
                  <p>No students match your search.</p>
                )}
              </>
            )}
          </section>

<<<<<<< HEAD
          {/* Student summary */}
          {student&&(
            <div style={{background:'linear-gradient(135deg,#e8f0fe,#e3f2fd)',borderRadius:14,padding:'16px 20px',marginBottom:28,border:'1px solid #bbdefb'}}>
              <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
                <div>
                  <h3 style={{fontSize:17,fontWeight:800,color:'#1a237e',margin:0}}>{student.fullName}</h3>
                  <p style={{fontSize:12,color:'#5c6bc0',margin:'4px 0 0'}}>USN: {student.usn} · Branch: {student.branch} · Year: {student.year}</p>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <StatCard icon="📈" label="Avg SGPA" value={avgSGPA} color="#1565c0"/>
                  <StatCard icon="🚫" label="Backlogs" value={parseInt(student.backlogs)||0} color="#e53935"/>
                  <StatCard icon="🏅" label="Certificates" value={certCount} color="#00897b"/>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {student&&(
            <div style={{marginBottom:28}}>
              <h2 className="section-heading">② Select Category</h2>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {CATEGORIES.map(c=>(
                  <button key={c.id} onClick={()=>{setCategory(c.id);setChartType('')}} style={{padding:'14px 18px',borderRadius:12,cursor:'pointer',flex:1,minWidth:130,border:category===c.id?'2px solid #1565c0':'2px solid #e3eeff',background:category===c.id?'#1565c0':'#fff',color:category===c.id?'#fff':'#37474f',fontWeight:600,fontSize:13,transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:4,boxShadow:category===c.id?'0 4px 14px rgba(21,101,192,0.25)':'none'}}>
                    <span style={{fontSize:22}}>{c.icon}</span>
                    <span>{c.id}</span>
                    <span style={{fontSize:11,fontWeight:400,color:category===c.id?'rgba(255,255,255,0.75)':'#b0bec5'}}>{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {student&&category&&(
            <div style={{marginBottom:28}}>
              <h2 className="section-heading">③ Choose Chart Type</h2>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {CHART_TYPES.map(c=>(
                  <button key={c.id} onClick={()=>setChartType(c.id)} style={{padding:'14px 20px',borderRadius:12,cursor:'pointer',flex:1,border:chartType===c.id?'2px solid #1565c0':'2px solid #e3eeff',background:chartType===c.id?'#e8f0fe':'#fff',color:chartType===c.id?'#1565c0':'#37474f',fontWeight:700,fontSize:14,transition:'all 0.2s',display:'flex',flexDirection:'column',alignItems:'center',gap:6,boxShadow:chartType===c.id?'0 4px 14px rgba(21,101,192,0.15)':'none'}}>
                    <span style={{fontSize:28}}>{c.icon}</span>
                    <span>{c.id} Chart</span>
                    <span style={{fontSize:11,fontWeight:400,color:'#90a4ae'}}>{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 - Chart */}
          {student&&category&&chartType&&(
            <div style={{background:'#fff',borderRadius:16,padding:'24px 20px',border:'2px solid #e3eeff',boxShadow:'0 4px 24px rgba(13,71,161,0.08)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:8}}>
                <div>
                  <h3 style={{fontSize:17,fontWeight:800,color:'#1a237e',margin:0}}>{category} Analytics</h3>
                  <p style={{fontSize:12,color:'#90a4ae',margin:'4px 0 0'}}>{student.fullName} · {chartType} Chart</p>
                </div>
                <div style={{display:'flex',gap:6}}>
                  {CHART_TYPES.map(c=>(
                    <button key={c.id} onClick={()=>setChartType(c.id)} style={{padding:'5px 12px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',border:chartType===c.id?'2px solid #1565c0':'2px solid #e3eeff',background:chartType===c.id?'#1565c0':'#f8faff',color:chartType===c.id?'#fff':'#546e7a'}}>{c.id}</button>
                  ))}
                </div>
              </div>
              <div style={{width:'100%',overflowX:'auto'}}>{renderChart()}</div>
              {chartData.length>0&&(
                <div style={{marginTop:24}}>
                  <h4 style={{fontSize:13,color:'#546e7a',marginBottom:10,fontWeight:700}}>📋 Data Table</h4>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                    <thead><tr style={{background:'#e8f0fe'}}>
                      <th style={{padding:'8px 14px',textAlign:'left',color:'#1565c0',fontWeight:700}}>Label</th>
                      <th style={{padding:'8px 14px',textAlign:'right',color:'#1565c0',fontWeight:700}}>Value</th>
                    </tr></thead>
                    <tbody>
                      {chartData.map((row,i)=>(
                        <tr key={i} style={{borderBottom:'1px solid #f0f4ff',background:i%2===0?'#fff':'#f8faff'}}>
                          <td style={{padding:'8px 14px',color:'#37474f'}}>
                            <span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',background:COLORS[i%COLORS.length],marginRight:8}}/>
                            {row.label}
                          </td>
                          <td style={{padding:'8px 14px',textAlign:'right',fontWeight:700,color:'#1a237e'}}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
=======
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
                <h2 style={{ color: '#1a237e', marginTop: 0 }}>
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
                    value={selectedStudent.backlogs || 0}
                    
                    color="#e53935"
                  />

                  <StatCard
                    label="Certificates"
                    value={certificateCount}
                    
                    color="#00897b"
                  />

                  <StatCard
                    label="Attendance"
                    value={averageAttendance === '—'
                      ? '—'
                      : `${averageAttendance}%`}
                    
                    color="#8e24aa"
                  />
                </div>
              </section>

              {/* CATEGORY SELECTION */}
              <section style={{ marginTop: 30 }}>
                <h2 className="section-heading">
                  ② Select Category
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
                      onClick={() => handleCategorySelect(cat)}
                      style={{
                        padding: 20,
                        borderRadius: 12,
                        border: category === cat
                          ? '2px solid #1565c0'
                          : '1px solid #dbeafe',
                        background: category === cat
                          ? '#1565c0'
                          : '#fff',
                        color: category === cat
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
                    ③ Choose Visualization
                  </h2>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    {CHART_TYPES.filter(type =>
                      type !== 'Heatmap' || category === 'Attendance'
                    ).map(type => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        style={{
                          padding: '14px 24px',
                          borderRadius: 10,
                          border: chartType === type
                            ? '2px solid #1565c0'
                            : '1px solid #dbeafe',
                          background: chartType === type
                            ? '#1565c0'
                            : '#fff',
                          color: chartType === type
                            ? '#fff'
                            : '#37474f',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {type === 'Heatmap'
                          ? '🟩 Heatmap'
                          : `${type} Chart`}
                      </button>
                    ))}
                  </div>
                </section>
>>>>>>> 623e29e (Update HOD dashboard and analytics)
              )}

<<<<<<< HEAD
          {!student&&!loading&&allStudents.length>0&&(
            <div style={{textAlign:'center',padding:'48px 24px',background:'linear-gradient(135deg,#f8faff,#e8f0fe)',borderRadius:16,border:'2px dashed #bbdefb'}}>
              <div style={{fontSize:52,marginBottom:12}}>📊</div>
              <h3 style={{color:'#1a237e',margin:'0 0 8px',fontSize:17}}>Select a student to begin</h3>
              <p style={{color:'#90a4ae',fontSize:14}}>Choose a student above, then pick a category and chart type.</p>
            </div>
=======
              {/* CHART */}
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
                    <div style={{ padding: 60, textAlign: 'center' }}>
                      Loading database records...
                    </div>
                  ) : error ? (
                    <div style={{ color: 'red', padding: 20 }}>
                      {error}
                    </div>
                  ) : (
                    <ChartRenderer
                      data={chartData}
                      chartType={chartType}
                      category={category}
                    />
                  )}

                  {/* ACTUAL DATA TABLE */}
                  {!dataLoading && category === 'Attendance' && (
                    <div style={{ marginTop: 30, overflowX: 'auto' }}>
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
                              <td style={{ padding: 12, textAlign: 'left' }}>
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
                              <td style={{ padding: 12, fontWeight: 700 }}>
                                {row.value}%
                              </td>
                            </tr>
                          ))}

                          {!attendanceData.length && (
                            <tr>
                              <td colSpan="5" style={{ padding: 20 }}>
                                No attendance records found for this student.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!dataLoading && category === 'Placements' && (
                    <div style={{ marginTop: 30, overflowX: 'auto' }}>
                      <h3>Placement Records</h3>

                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse'
                        }}
                      >
                        <thead>
                          <tr style={{ background: '#e8f0fe' }}>
                            <th style={{ padding: 12 }}>Company</th>
                            <th style={{ padding: 12 }}>Package</th>
                            <th style={{ padding: 12 }}>Year</th>
                            <th style={{ padding: 12 }}>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {placements.map(row => (
                            <tr
                              key={row.id}
                              style={{ textAlign: 'center' }}
                            >
                              <td style={{ padding: 12 }}>{row.company}</td>
                              <td style={{ padding: 12 }}>{row.package || '—'}</td>
                              <td style={{ padding: 12 }}>{row.placement_year || '—'}</td>
                              <td style={{ padding: 12 }}>{row.status || '—'}</td>
                            </tr>
                          ))}

                          {!placements.length && (
                            <tr>
                              <td colSpan="4" style={{ padding: 20 }}>
                                No placement records found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!dataLoading && category === 'Certificates' && (
                    <div style={{ marginTop: 30, overflowX: 'auto' }}>
                      <h3>Certificate Records</h3>

                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse'
                        }}
                      >
                        <thead>
                          <tr style={{ background: '#e8f0fe' }}>
                            <th style={{ padding: 12 }}>Certificate</th>
                            <th style={{ padding: 12 }}>Category</th>
                            <th style={{ padding: 12 }}>Organization</th>
                            <th style={{ padding: 12 }}>Issue Date</th>
                          </tr>
                        </thead>

                        <tbody>
                          {certificates.map(row => (
                            <tr
                              key={row.id}
                              style={{ textAlign: 'center' }}
                            >
                              <td style={{ padding: 12 }}>
                                {row.certificate_name}
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
                              <td colSpan="4" style={{ padding: 20 }}>
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
>>>>>>> 623e29e (Update HOD dashboard and analytics)
          )}
        </div>
      </div>
    </div>
  )
}