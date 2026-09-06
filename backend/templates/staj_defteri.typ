#let data = json(sys.inputs.data_file)
#set text(font: "Times New Roman", size: 11pt)
#set page(paper: "a4", margin: 2cm)

// ==========================================
// PAGE 1: COVER (KAPAK)
// ==========================================
#align(center)[
  #v(2cm)
  #text(weight: "bold", size: 14pt)[T.C.] \
  #text(weight: "bold", size: 14pt)[KONYA TEKNİK ÜNİVERSİTESİ] \
  #text(weight: "bold", size: 14pt)[MÜHENDİSLİK VE DOĞA BİLİMLERİ FAKÜLTESİ]
  #v(4cm)
  #text(weight: "bold", size: 36pt)[STAJ DEFTERİ]
  #v(4cm)
  
  #rect(width: 80%, stroke: 1pt, inset: 1cm)[
    #align(left)[
      #grid(columns: (100px, 1fr), row-gutter: 1.5em,
        [*BÖLÜMÜ*], [: #data.student.department],
        [*NUMARASI*], [: #data.student.number],
        [*ADI SOYADI*], [: #data.student.name]
      )
    ]
  ]
]

#pagebreak()

// ==========================================
// PAGE 2: INNER COVER (PRATİK ÇALIŞMA DEFTERİ)
// ==========================================
#align(center)[
  #text(weight: "bold", size: 12pt)[T.C.] \
  #text(weight: "bold", size: 12pt)[KONYA TEKNİK ÜNİVERSİTESİ] \
  #text(weight: "bold", size: 12pt)[MÜHENDİSLİK VE DOĞA BİLİMLERİ FAKÜLTESİ] \
  #rect(width: 100%, fill: luma(200), inset: 5pt)[
    #text(weight: "bold", size: 14pt)[PRATİK ÇALIŞMA DEFTERİ]
  ]
]
#v(0.5cm)

#table(
  columns: (3cm, 1fr, 3cm),
  stroke: 1pt,
  
  [*ÖĞRENCİNİN*],
  [
    *Bölümü:* #data.student.department \
    *Numarası:* #data.student.number \
    *Adı-Soyadı:* #data.student.name \
    *Çalışma Devresi:* Yaz Stajı \
    *Başlama Tarihi:* #data.internship.startDate \
    *Bitiş Tarihi:* #data.internship.endDate \
    *İşgünü Sayısı:* #data.internship.totalDays
  ],
  align(center + horizon)[Fotoğraf]
)
#v(0.2cm)

#table(
  columns: (3cm, 1fr, 5cm),
  stroke: 1pt,
  
  [*İŞYERİNİN*],
  [
    *Adı ve Adresi:* #data.company.name \
    #data.company.address \
    \
    *İşyeri Adına Defteri Onaylayan Amirin* \
    *Adı Soyadı:* #data.company.supervisorName \
    *Ünvanı:* #data.company.supervisorTitle \
  ],
  align(center + horizon)[
    Yukarıda kimliği bulunan öğrencinin iş yerimizde #data.internship.totalDays iş günü pratik çalışma yaptığını ve bu defteri kendisinin düzenlediğini onaylarım. \
    \
    *İmza ve Mühür* \
    ......./......./20.....
  ]
)
#v(0.2cm)

#table(
  columns: (1fr),
  stroke: 1pt,
  align(center)[*PRATİK ÇALIŞMALARI İNCELEME KOMİSYONUNUN KANAATİ*],
  [
    *Yapılan Çalışma* \
    [   ] ...... iş günlük devre çalışması olarak kabul edilmiştir. \
    [   ] Kabule uygun görülmemiştir. \
    \
    #align(center)[*Staj Komisyonu*]
    #grid(columns: (1fr, 1fr, 1fr),
      align(center)[*Başkan* \ Adı-Soyadı],
      align(center)[*Üye* \ Adı-Soyadı],
      align(center)[*Üye* \ Adı-Soyadı]
    )
    #v(1cm)
  ]
)

// ==========================================
// PAGES 3+: DAILY LOGS
// ==========================================
#for (i, log) in data.logs.enumerate() [
  #pagebreak(weak: true)
  #grid(columns: (1fr, 1fr),
    [ *Kurum:* #data.company.name ],
    align(right)[ *Sayfa:* #(i+1) ]
  )
  #line(length: 100%, stroke: 0.5pt)
  #v(0.3cm)
  
  #grid(columns: (auto, 1fr), row-gutter: 0.5em,
    [*Tarih:*], [ #log.date ],
    [*Çalışılan Departman:*], [ #log.department ]
  )
  #v(0.5cm)
  
  #text(weight: "bold")[Yapılan İşler:] \
  #log.content
  
  #v(1fr) 
  #line(length: 100%, stroke: 0.5pt)
  #grid(columns: (1fr, 1fr),
    [],
    align(center)[
      *Onaylayan Amir* \
      #data.company.supervisorName \
      İmza / Kaşe
    ]
  )
]