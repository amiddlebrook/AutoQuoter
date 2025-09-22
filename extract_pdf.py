import PyPDF2

# Open the PDF file
with open('AutoQuoter_Final.pdf', 'rb') as file:
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()

# Save to a text file
with open('AutoQuoter_PRD.txt', 'w') as f:
    f.write(text)

print("Text extracted and saved to AutoQuoter_PRD.txt")
