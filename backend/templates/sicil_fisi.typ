#let data = json(sys.inputs.data_file)
#set page(paper: "a4", margin: 1.5cm)
#set text(font: "Times New Roman", size: 10pt)

// Header with Logo
#grid(
  columns: (auto, 1fr, auto),
  align(left)[#image("logo.png", width: 2.5cm)],
  align(center)[
    #text(weight: "bold", size: 12pt)[
      T.C. \
      KONYA TEKNİK ÜNİVERSİTESİ \
      MÜHENDİSLİK VE DOĞA BİLİMLERİ FAKÜLTESİ \
      DEKANLIĞI
    ] \
    #v(0.5cm)
    #text(weight: "bold", size: 14pt)[PRATİK SİCİL FİŞİ]
  ],
  rect(width: 3.5cm, height: 4.5cm, stroke: 1pt)[
    #align(center + horizon)[Fotoğraf Alanı]
  ]
)
#v(0.5cm)

// Student Info (Added Inset for Padding)
#table(
  columns: (3cm, 1fr, 2.5cm, 1fr),
  stroke: 0.5pt,
  inset: 6pt, 
  
  [*ADI SOYADI*], [#data.student.name], [*BÖLÜMÜ*], [#data.student.department],
  [*OKUL NO*], [#data.student.number], [*SINIFI*], [#data.student.classYear],
  [*DOĞUM YILI*], [#data.student.birthYear], [*D. YERİ*], [#data.student.birthPlace],
  
  [*TARİH*], 
  table.cell(colspan: 3)[
    İşe Başlama: #data.internship.startDate | İş Bitiş: #data.internship.endDate
  ],
  
  [*GÜNLER*],
  table.cell(colspan: 3)[
    Çalıştığı: #data.internship.workedDays | Çalışmadığı: #data.internship.absentDays
  ],
  
  [*ÇALIŞTIĞI KISIMLAR*], table.cell(colspan: 3)[#data.internship.departmentsWorked]
)
#v(0.5cm)

// Grades Table (Added Padding and Center Alignment)
#table(
  columns: (1fr, 3.5cm),
  stroke: 0.5pt,
  inset: 6pt,
  
  align(left)[*DEĞERLENDİRME KRİTERİ*], align(center)[*NOTU (A/B/C/D/E)*],
  [DEVAM VE DİSİPLİN], align(center)[#data.evaluation.attendance],
  [ÇALIŞMA VE GAYRET], align(center)[#data.evaluation.effort],
  [İŞİ VAKTİNDE VE TAM YAPMA], align(center)[#data.evaluation.timeliness],
  [TAVIR VE DAVRANIŞ], align(center)[#data.evaluation.behavior],
  [TAKIM ÇALIŞMASI VE İLETİŞİM], align(center)[#data.evaluation.teamwork],
  [ETİK VE SORUMLULUK BİLİNCİ], align(center)[#data.evaluation.ethics],
  [KENDİNİ GELİŞTİRME VE ÖĞRENMEYE AÇIKLIK], align(center)[#data.evaluation.learning],
  [YENİLİKÇİ VE ÇÖZÜM ODAKLI YAKLAŞIM], align(center)[#data.evaluation.innovation]
)
#v(0.2cm)
#text(size: 9pt)[*Notlar:* A- Pekiyi, B- İyi, C- Orta, D- Geçer, E- Fena]
#v(0.5cm)

// Signatures Table (Cleaned up QR)
#table(
  columns: (1fr, 1fr),
  stroke: 0.5pt,
  inset: 8pt,
  align(center)[*İŞ YERİ AMİRİ ONAYI*],
  align(center)[*FAKÜLTE TASDİKİ*],
  
  rect(width: 100%, height: 3.5cm, stroke: none)[
    #align(left)[
      *İsim:* #data.company.supervisorName \
      *Tarih:* #data.evaluation.timestamp \
      *IP Onayı:* #data.evaluation.ipAddress
    ]
  ],
  rect(width: 100%, height: 3.5cm, stroke: none)[
    #align(center + horizon)[
      #image(data.qrCodeSvgPath, width: 2.2cm) \
      #text(size: 8pt)[Dijital Doğrulama Kodu]
    ]
  ]
)