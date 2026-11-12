from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)

NAVY  = RGBColor(0x0F,0x17,0x2A)
BLUE  = RGBColor(0x25,0x63,0xEB)
WHITE = RGBColor(0xFF,0xFF,0xFF)
BLACK = RGBColor(0x1F,0x29,0x37)
AMBER = RGBColor(0xF5,0x9E,0x0B)
GREEN = RGBColor(0x16,0xA3,0x4A)
RED   = RGBColor(0xDC,0x26,0x26)
LGRAY = RGBColor(0xF1,0xF5,0xF9)
DGRAY = RGBColor(0x64,0x74,0x8B)
PURP  = RGBColor(0x7C,0x3A,0xED)
TEAL  = RGBColor(0x0D,0x94,0x88)

URL = 'smart-library-production-8a77.up.railway.app'

def blank(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])

def box(slide, l, t, w, h, fill=None, line=None):
    s = slide.shapes.add_shape(1, Inches(l), Inches(t), Inches(w), Inches(h))
    if fill:
        s.fill.solid(); s.fill.fore_color.rgb = fill
    else:
        s.fill.background()
    if line:
        s.line.color.rgb = line; s.line.width = Pt(1.2)
    else:
        s.line.fill.background()
    return s

def txt(slide, text, l, t, w, h, size=14, bold=False, color=None, align=PP_ALIGN.LEFT):
    if color is None: color = BLACK
    tb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tb.word_wrap = True
    p = tb.text_frame.paragraphs[0]
    p.alignment = align
    r = p.add_run()
    r.text = text
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color
    return tb

def two_run(slide, t1, t2, l, t, w, h, size=14, c1=None, c2=None):
    if c1 is None: c1 = BLACK
    if c2 is None: c2 = NAVY
    tb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tb.word_wrap = True
    p = tb.text_frame.paragraphs[0]
    r1 = p.add_run(); r1.text = t1; r1.font.size=Pt(size); r1.font.color.rgb=c1
    r2 = p.add_run(); r2.text = t2; r2.font.size=Pt(size); r2.font.bold=True; r2.font.color.rgb=c2

def header(slide, title, pg):
    box(slide,0,0,13.33,1.1,fill=NAVY)
    txt(slide,title,0.3,0.2,12,0.75,size=24,bold=True,color=WHITE)
    box(slide,0.3,1.15,1.2,0.06,fill=AMBER)
    box(slide,1.55,1.15,1.2,0.06,fill=GREEN)
    box(slide,2.8,1.15,1.2,0.06,fill=RED)
    box(slide,4.05,1.15,1.2,0.06,fill=BLUE)
    box(slide,0,7.0,13.33,0.5,fill=RGBColor(0xBF,0xDB,0xFE))
    txt(slide,'Department of Advanced Computer Science and Engineering',0.2,7.05,11,0.4,size=11,bold=True,color=NAVY)
    txt(slide,str(pg),12.6,7.05,0.5,0.4,size=11,bold=True,color=NAVY,align=PP_ALIGN.RIGHT)

def dot_bullet(slide, x, y):
    d = slide.shapes.add_shape(9,Inches(x),Inches(y+0.11),Inches(0.13),Inches(0.13))
    d.fill.solid(); d.fill.fore_color.rgb = NAVY; d.line.fill.background()

# SLIDE 1: TITLE
sl = blank(prs)
box(sl,0,0,13.33,2.2,fill=NAVY)
txt(sl,'Smart Library Book Locator',0.5,0.2,12.3,0.85,size=30,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
txt(sl,'and Management System',0.5,0.95,12.3,0.8,size=28,bold=True,color=WHITE,align=PP_ALIGN.CENTER)

# 4-Color Accent Stripe under header
box(sl,0.5,2.22,3.0,0.06,fill=AMBER)
box(sl,3.55,2.22,3.0,0.06,fill=GREEN)
box(sl,6.6,2.22,3.0,0.06,fill=RED)
box(sl,9.65,2.22,3.18,0.06,fill=BLUE)

txt(sl,'Presented BY:',1.5,2.45,10.3,0.35,size=13,bold=True,color=BLUE,align=PP_ALIGN.CENTER)

# 2x2 grid for 4 student presenters
txt(sl,'241FA18252 - Syed Shafiulla',1.5,2.85,5.0,0.35,size=13,bold=True,color=BLACK,align=PP_ALIGN.RIGHT)
txt(sl,'241FA18256 - Syad Saniya',6.8,2.85,5.0,0.35,size=13,bold=True,color=BLACK,align=PP_ALIGN.LEFT)
txt(sl,'241FA18194 - Balaji Thilak Babu',1.5,3.25,5.0,0.35,size=13,bold=True,color=BLACK,align=PP_ALIGN.RIGHT)
txt(sl,'241FA18340 - Pavan Aditya',6.8,3.25,5.0,0.35,size=13,bold=True,color=BLACK,align=PP_ALIGN.LEFT)

txt(sl,'Under the Supervision of',1.5,3.75,10.3,0.32,size=12,bold=True,color=BLACK,align=PP_ALIGN.CENTER)
txt(sl,'Ms. [Faculty Name]',1.5,4.08,10.3,0.32,size=12,bold=True,color=BLUE,align=PP_ALIGN.CENTER)

box(sl,0,5.1,13.33,2.4,fill=LGRAY)
txt(sl,'Department of Advanced Computer Science and Engineering',0.5,5.25,12.3,0.45,size=14,bold=True,color=NAVY,align=PP_ALIGN.CENTER)
txt(sl,'School of Computing and Informatics',0.5,5.72,12.3,0.38,size=13,color=BLACK,align=PP_ALIGN.CENTER)
txt(sl,"Vignan's Foundation for Science, Technology and Research",0.5,6.12,12.3,0.38,size=13,color=BLACK,align=PP_ALIGN.CENTER)
txt(sl,'(Deemed to be University) • Guntur, Andhra Pradesh, India',0.5,6.52,12.3,0.38,size=12,color=DGRAY,align=PP_ALIGN.CENTER)

# SLIDE 2: INTRODUCTION
sl = blank(prs)
header(sl,'Introduction',2)
pts = [
    ('Libraries contain thousands of books across multiple floors, racks and shelves. ','Students waste 15-30 minutes searching manually.'),
    ('Traditional systems only manage borrow records. ','No physical location guidance is provided to users.'),
    ('The Smart Library Book Locator and Management System enables ','role-based login using institutional ID cards.'),
    ('Users can search books by category or subject and view ','exact Floor, Rack, and Shelf location instantly.'),
    ('The system also supports ','digital study hall entry, borrowing, returning, and complete admin management.'),
]
for i,(p1,p2) in enumerate(pts):
    y=1.35+i*0.6
    dot_bullet(sl,0.35,y)
    two_run(sl,p1,p2,0.62,y,12.3,0.52,size=15,c1=BLACK,c2=NAVY)

# SLIDE 3: PROBLEM STATEMENT
sl = blank(prs)
header(sl,'Problem Statement',3)
txt(sl,'Students and faculty in traditional libraries face the following major challenges:',0.35,1.3,12.5,0.4,size=14,color=BLACK)
probs = [
    ('No physical location guidance: ','Students search floor-by-floor manually, wasting 15-30 minutes per visit.'),
    ('No real-time availability: ','Students visit the library only to find the required book is already borrowed.'),
    ('Manual borrow/return records: ','Paper-based ledgers are error-prone and cannot auto-enforce borrowing limits.'),
    ('No role-based access: ','Students and faculty have no differentiated borrowing privileges or loan durations.'),
    ('No digital study hall tracking: ','Study visits are not recorded or managed through any digital platform.'),
]
for i,(bold,rest) in enumerate(probs):
    y=1.78+i*0.95
    box(sl,0.3,y,12.7,0.82,fill=LGRAY,line=BLUE)
    two_run(sl,bold,rest,0.48,y+0.18,12.1,0.5,size=14,c1=NAVY,c2=BLACK)

# SLIDE 4: METHODOLOGY
sl = blank(prs)
header(sl,'Methodology',4)
phases = [
    ('Phase 1: Requirements Analysis','Studied needs of students, faculty, and admin. Defined features and 12-table database schema.'),
    ('Phase 2: Database Design','Seeded 250+ books, 700 students (241FA18001-700), 1001 faculty (1001-2001), 4 floors, 100 racks, 5 shelves.'),
    ('Phase 3: Backend Development','Built REST API using Python Flask with 16 endpoints for auth, search, borrow, return, and admin.'),
    ('Phase 4: Frontend Development','Single Page App with live search, 2D SVG floor map, 5-tier shelf diagram, and role-based dashboard.'),
    ('Phase 5: Deployment','Deployed on Railway.app. Live at: ' + URL),
]
for i,(phase,desc) in enumerate(phases):
    y=1.3+i*1.06
    box(sl,0.3,y+0.08,0.08,0.35,fill=BLUE)
    txt(sl,phase,0.5,y+0.08,12.5,0.33,size=14,bold=True,color=NAVY)
    txt(sl,desc,0.5,y+0.43,12.5,0.38,size=13,color=BLACK)

# SLIDE 5: SYSTEM MODULES
sl = blank(prs)
header(sl,'System Modules / Features',5)
modules = [
    ('Authentication System','Student IDs: 241FA18001-700  |  Faculty IDs: 1001-2001  |  Admin  |  Smart ID normalization'),
    ('Book Catalog and Search','250+ books, 15 categories, 100+ subjects. Live search by title, author, subject, rack number.'),
    ('Physical Book Locator','4 Floors, 100 Racks per floor, 5 Shelf tiers. 2D SVG map with pulsing rack marker and walking directions.'),
    ('Borrow and Return System','Students: 3 books / 14 days. Faculty: 10 books / 30 days. 1-click Return All to reset quota.'),
    ('Study Hall Entry','Direct digital entry pass. No seat reservation needed. Auto-logs user ID and entry timestamp.'),
    ('Admin Panel','Add, Edit, Delete books. View all borrow records. Manage student and faculty user accounts.'),
]
for i,(mod,desc) in enumerate(modules):
    col=i%2; row=i//2
    x=0.3+col*6.6; y=1.3+row*1.78
    box(sl,x,y,6.3,1.65,fill=LGRAY,line=BLUE)
    txt(sl,mod,x+0.18,y+0.1,5.9,0.38,size=14,bold=True,color=NAVY)
    txt(sl,desc,x+0.18,y+0.52,5.9,0.88,size=12,color=BLACK)

# SLIDE 6: SYSTEM FLOW
sl = blank(prs)
header(sl,'System Flow / Workflow',6)
steps = [
    ('1','Open Website',URL),
    ('2','Login with ID','Student 241FA18XXX, Faculty 1001-2001, or Admin'),
    ('3','Dashboard Loads','Choose: Borrow a Book  OR  Study in Library'),
    ('4','Search Book','Select Category, then Subject, then view Book Cards'),
    ('5','View Location','Floor, Rack number, and Shelf number shown on card'),
    ('6','Locate on Map','2D floor plan opens with pulsing blue rack marker'),
    ('7','Borrow Book','Quota checked. Book issued with due date set automatically.'),
    ('8','Return Book','1-click return from My Loans or Return All to reset quota'),
]
for i,(num,step,detail) in enumerate(steps):
    col=i%2; row=i//2
    x=0.3+col*6.6; y=1.3+row*1.42
    box(sl,x,y,0.5,0.5,fill=NAVY)
    txt(sl,num,x,y+0.06,0.5,0.38,size=15,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    txt(sl,step,x+0.62,y+0.04,5.8,0.32,size=14,bold=True,color=NAVY)
    txt(sl,detail,x+0.62,y+0.36,5.8,0.35,size=12,color=DGRAY)

# SLIDE 7: CURRENT IMPLEMENTATION
sl = blank(prs)
header(sl,'Current Implementation',7)
impl = [
    ('Backend','Python 3 + Flask with 16 REST API endpoints for auth, books, loans, study, and admin operations.'),
    ('Database','SQLite3 with 12 tables: 250+ books, 700 students, 1001 faculty, 4 floors, 100 racks, 5 shelves.'),
    ('Frontend','Vanilla JavaScript SPA with live search, role-based dashboard, and book cards with location details.'),
    ('Floor Locator','Interactive 2D SVG floor map with pulsing rack marker and 5-tier shelf cabinet elevation diagram.'),
    ('Deployment','Railway.app — Live URL: ' + URL),
    ('Version Control','GitHub — github.com/saniyasyed097-cyber/smart-library'),
]
for i,(label,desc) in enumerate(impl):
    y=1.3+i*0.9
    box(sl,0.3,y,2.2,0.42,fill=NAVY)
    txt(sl,label,0.35,y+0.04,2.1,0.34,size=13,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    txt(sl,desc,2.65,y+0.06,10.4,0.5,size=13,color=BLACK)

# SLIDE 8: ARCHITECTURE
sl = blank(prs)
header(sl,'Architecture Diagram',8)
layers = [
    (RGBColor(0xDB,0xEA,0xFE),BLUE,'CLIENT LAYER (Browser)',
     'index.html (Jinja2)   |   app.js (SPA Controller)   |   locator.js (2D Map)   |   styles.css'),
    (RGBColor(0xDC,0xFC,0xE7),GREEN,'BACKEND LAYER (Python Flask — app.py)',
     '/api/auth  |  /api/books  |  /api/loans  |  /api/study  |  /api/admin  (16 REST Endpoints)'),
    (RGBColor(0xFE,0xF3,0xC7),AMBER,'DATABASE LAYER (db.py)',
     'MySQL Primary (Port 3306)   |   SQLite3 library.db (Auto-Fallback)   |   12 Tables   |   250+ Books'),
    (RGBColor(0xED,0xE9,0xFE),PURP,'DEPLOYMENT — Railway.app',
     'GitHub Auto-Deploy  -->  ' + URL),
]
arrows = ['HTTP / REST API (JSON)','SQL Queries (Parameterized)','GitHub Auto-Deploy']
for i,(bg,lc,title,detail) in enumerate(layers):
    y=1.3+i*1.3
    box(sl,0.4,y,12.5,1.15,fill=bg,line=lc)
    txt(sl,title,0.6,y+0.08,12,0.38,size=13,bold=True,color=lc)
    txt(sl,detail,0.6,y+0.5,12,0.5,size=12,color=BLACK,align=PP_ALIGN.CENTER)
    if i<3:
        txt(sl,'-- ' + arrows[i] + ' -->',4.2,y+1.17,6.5,0.28,size=11,color=DGRAY,align=PP_ALIGN.CENTER)

# SLIDE 9: RESULTS AND ANALYSIS
sl = blank(prs)
header(sl,'Results and Analysis',9)
txt(sl,'Test Cases Verified',0.3,1.28,5.9,0.38,size=15,bold=True,color=NAVY)
tests = [
    ('Login 241FA18025','Student Dashboard','Pass'),
    ('Login Faculty 1001','Faculty Dashboard','Pass'),
    ('Login admin123','Admin Panel','Pass'),
    ('Borrow 3rd book','Book Issued','Pass'),
    ('Borrow 4th book','Limit Modal','Pass'),
    ('Locate Python Book','Floor1 Rack16 Shelf3','Pass'),
    ('Return All Books','Quota Reset','Pass'),
    ('Study Hall Entry','Entry Logged','Pass'),
]
for i,(test,exp,res) in enumerate(tests):
    y=1.7+i*0.56
    bg=RGBColor(0xF0,0xFF,0xF4) if i%2==0 else WHITE
    box(sl,0.3,y,5.9,0.52,fill=bg,line=RGBColor(0xE2,0xE8,0xF0))
    txt(sl,test,0.4,y+0.06,2.1,0.38,size=11,color=BLACK)
    txt(sl,exp,2.55,y+0.06,2.2,0.38,size=11,color=DGRAY)
    txt(sl,'['+res+']',4.85,y+0.06,1.2,0.38,size=11,bold=True,color=GREEN,align=PP_ALIGN.CENTER)

txt(sl,'System Statistics',6.8,1.28,6,0.38,size=15,bold=True,color=NAVY)
stats = [
    ('250+','Books in Catalog',BLUE),
    ('700','Student Records',GREEN),
    ('1001','Faculty Records',PURP),
    ('4','Library Floors',AMBER),
    ('100','Racks / Floor',RED),
    ('15','Categories',TEAL),
]
for i,(num,label,color) in enumerate(stats):
    col=i%2; row=i//2
    x=6.8+col*3.1; y=1.7+row*1.56
    box(sl,x,y,2.9,1.4,fill=LGRAY,line=color)
    txt(sl,num,x,y+0.15,2.9,0.72,size=32,bold=True,color=color,align=PP_ALIGN.CENTER)
    txt(sl,label,x,y+0.9,2.9,0.38,size=12,color=DGRAY,align=PP_ALIGN.CENTER)

# SLIDE 10: CONCLUSION
sl = blank(prs)
header(sl,'Conclusion',10)
txt(sl,'The Smart Library Book Locator and Management System successfully addresses all major library challenges:',
    0.35,1.28,12.5,0.48,size=14,color=BLACK)
concs = [
    ('Digital Book Discovery','Students find any book in seconds without manually searching through floors and racks.'),
    ('Precise Physical Navigation','Interactive 2D floor map and 5-tier shelf diagram guides users to the exact book.'),
    ('Fair Resource Management','Automated limits: 3 books / 14 days for Students, 10 books / 30 days for Faculty.'),
    ('Real-Time Availability','Users know if a book is available before physically visiting the library.'),
    ('Role-Based Security','Students, Faculty, and Admin have clearly defined access levels and privileges.'),
    ('Live Deployment','Accessible from any device worldwide: ' + URL),
]
for i,(check,desc) in enumerate(concs):
    y=1.82+i*0.83
    box(sl,0.3,y,12.7,0.72,fill=LGRAY,line=BLUE)
    txt(sl,'[OK]  '+check,0.45,y+0.14,3.2,0.42,size=12,bold=True,color=GREEN)
    txt(sl,desc,3.85,y+0.14,9.0,0.42,size=12,color=BLACK)

# SLIDE 11: REFERENCES
sl = blank(prs)
header(sl,'References',11)
refs = [
    '[1] R. Sharma and A. Kumar, "Digital Library Management System using Web Technologies," IJCA, vol.177, no.27, pp.1-5, 2020.',
    '[2] S. Patil and M. Kulkarni, "Web-Based Library Information System for Academic Institutions," IJERT, vol.9, no.6, 2021.',
    '[3] M. Grinberg, Flask Web Development: Developing Web Applications with Python, 2nd ed., O\'Reilly Media, 2018.',
    '[4] R. Thareja, Python Programming: Using Problem Solving Approach, Oxford University Press, 2017.',
    '[5] Python Software Foundation, Python 3 Documentation. [Online]. Available: https://docs.python.org/3/ [Accessed: Sep. 2026].',
    '[6] Pallets Projects, Flask 3.0 Documentation. [Online]. Available: https://flask.palletsprojects.com/ [Accessed: Sep. 2026].',
    '[7] SQLite Consortium, SQLite Documentation. [Online]. Available: https://www.sqlite.org/docs.html [Accessed: Sep. 2026].',
    '[8] Mozilla Developer Network, JavaScript Guide. [Online]. Available: https://developer.mozilla.org/ [Accessed: Sep. 2026].',
    '[9] W3Schools, HTML CSS JavaScript Reference. [Online]. Available: https://www.w3schools.com/ [Accessed: Sep. 2026].',
    '[10] Railway Technologies, Deployment Docs. [Online]. Available: https://docs.railway.app/ [Accessed: Sep. 2026].',
]
for i,ref in enumerate(refs):
    y=1.28+i*0.548
    txt(sl,ref,0.35,y,12.6,0.48,size=11,color=BLACK)

out = r'C:\Users\syedj\.gemini\antigravity\scratch\smart-library-flask\Smart_Library_PPT.pptx'
prs.save(out)
print('DONE:', out)

