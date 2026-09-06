#let data = json(sys.inputs.data_file)
#set page(paper: "a4", margin: (top: 3cm, bottom: 3cm, left: 2.5cm, right: 2.5cm))
#set text(font: "Times New Roman", size: 12pt)
#set par(justify: true, leading: 1.5em)

#align(center)[
  #text(weight: "bold")[
    T.C. \
    KONYA TEKNİK ÜNİVERSİTESİ \
    MÜHENDİSLİK VE DOĞA BİLİMLERİ FAKÜLTESİ \
    #upper(data.department.name) BÖLÜM BAŞKANLIĞI
  ]
]
#v(1cm)

#grid(
  columns: (1fr, 1fr),
  [
    *Bölüm* : #data.department.name \
    *Sayı* : 19877834/ \
    *Konu* : Staj Zorunluluk Belgesi
  ],
  align(right)[
    *Konya, #data.date*
  ]
)
#v(1.5cm)

#align(center)[
  #text(weight: "bold", size: 14pt)[İLGİLİ MAKAMA]
]
#v(0.5cm)

#h(1cm) #data.department.name Bölümü öğrencilerinin lisans diplomasına hak kazanabilmeleri için tamamlamaları gerekli ders kredisi yanında, yaz dönemlerinde belirli sürelerde staj çalışmaları yapmaları zorunludur.

#h(1cm) Bölümümüz *#data.student.number* numaralı *#data.student.name* isimli öğrenci, *#data.academicYear* Öğretim yılı yaz döneminde *40 (kırk)* iş günü yaz stajı yapması gerekmektedir. İlgili öğrencinin staj yaptığı tarihler arasındaki iş kazası ve meslek hastalığı sigortası primi Üniversitemizce karşılanacaktır.

#h(1cm) Adı geçen öğrencinin işletmenizde staj yapması kabul edildiği takdirde, iş ve staj disiplinine uyması hususunda gereken titizliğin gösterilmesini ümit eder, iş birliğiniz için teşekkür ederim.

#v(2cm)
#align(right)[
  #text(weight: "bold")[
    #data.department.headName \
    #data.department.name \
    #data.department.headTitle
  ]
]