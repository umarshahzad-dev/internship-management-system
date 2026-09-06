#let data = json(sys.inputs.data_file)
#set page(paper: "a4", margin: 1.5cm)
#set text(font: "Times New Roman", size: 10pt)

// Header & Photo Box
#grid(
  columns: (1fr, auto),
  align(center)[
    #text(weight: "bold", size: 12pt)[
      T.C. \
      KONYA TEKNİK ÜNİVERSİTESİ \
      MÜHENDİSLİK VE DOĞA BİLİMLERİ FAKÜLTESİ \
      DEKANLIĞI
    ] \
    #v(1cm)
    #text(weight: "bold", size: 14pt)[PRATİK SİCİL FİŞİ]
  ],
  rect(width: 3.5cm, height: 4.5cm, stroke: 1pt)[
    #align(center + horizon)[Fotoğraf]
  ]
)
#v(0.5cm)

// Student & Internship Info Table
#table(
  columns: (3cm, 1fr, 2.5cm, 1fr),
  stroke: 0.5pt,
  
  [ADI SOYADI], [#data.student.name], [BÖLÜMÜ], [#data.student.department],
  [OKUL NO], [#data.student.number], [SINIFI], [#data.student.classYear],
  [DOĞUM YILI], [#data.student.birthYear], [D. YERİ], [#data.student.birthPlace],
  
  [TARİH], 
  table.cell(colspan: 3)[
    #grid(columns: (auto, 1fr, auto, 1fr),
      [İşe Başlama :], [#data.internship.startDate],
      [İşi Bitiş :], [#data.internship.endDate]
    )
  ],
  
  [GÜNLER],
  table.cell(colspan: 3)[
    #grid(columns: (auto, 1fr, auto, 1fr),
      [Çalıştığı :], [#data.internship.workedDays],
      [Çalışmadığı :], [#data.internship.absentDays]
    )
  ],
  
  [ÇALIŞTIĞI KISIMLAR], table.cell(colspan: 3)[#data.internship.departmentsWorked]
)
#v(0.5cm)

// Evaluation Grades Table
#table(
  columns: (1fr, 3cm),
  stroke: 0.5pt,
  
  [*DEĞERLENDİRME KRİTERİ*], [*NOTU (A/B/C/D/E)*],
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

// Signatures Table
#table(
  columns: (1fr, 1fr),
  stroke: 0.5pt,
  align(center)[
    *ÇALIŞMAYI KONTROL EDEN İŞ YERİ AMİRİNİN* \
    *İSİM, İMZA VE MÜHÜRÜ*
  ],
  align(center + horizon)[
    *NETİCEYİ TASDİK FAKÜLTEYE AİTTİR*
  ],
  rect(width: 100%, height: 3cm, stroke: none)[
    #align(left)[
      #v(0.2cm)
      *İsim:* #data.company.supervisorName \
      *Tarih:* #data.evaluation.timestamp \
      *IP Onayı:* #data.evaluation.ipAddress
    ]
  ],
  rect(width: 100%, height: 3cm, stroke: none)[
    // Empty for Academic Signature
  ]
)