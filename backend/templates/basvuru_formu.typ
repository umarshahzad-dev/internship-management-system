#let data = json(sys.inputs.data_file)

#set page(paper: "a4", margin: 2cm)
#text(size: 18pt, weight: "bold")[Staj Başvuru Formu]
#v(0.5cm)

#text(size: 12pt)[
  Öğrenci: #data.student.firstName #data.student.lastName \
  Öğrenci No: #data.student.studentNumber \
  Email: #data.student.email
]
#v(0.3cm)

#text(size: 12pt)[
  Şirket: #data.company.name \
  Vergi No: #data.company.taxNumber \
  SGK No: #data.company.sgkNumber
]
#v(0.3cm)

#text(size: 12pt)[
  Staj Başlangıç: #data.internship.startDate \
  Staj Bitiş: #data.internship.endDate \
  Durum: #data.internship.status
]
#v(0.5cm)

#text(size: 12pt, weight: "bold")[Dijital İmzalar]
#text(size: 10pt)[
  İşveren IP: #data.signatures.employerIp \
  İşveren Onay Zamanı: #data.signatures.employerTimestamp \
  Komisyon Onay Zamanı: #data.signatures.commissionTimestamp
]
#v(0.5cm)

#text(size: 10pt)[Doğrulama: #data.verificationUrl]