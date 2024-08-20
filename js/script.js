// script.js
$(document).ready(function () {
  // File input change event
  $("#file-input").on("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileContent = event.target.result;
      const fileType = file.type;
      let text = "";

      // Display file content
      const iframe = $(
        '<iframe frameborder="0" width="100%" height="300"></iframe>'
      );
      iframe.attr("src", URL.createObjectURL(file));
      $("#file-preview").html(iframe);

      // Extract text based on file type
      if (
        fileType === "application/msword" ||
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Extract text from Word document
        mammoth
          .extractRawText({ arrayBuffer: fileContent })
          .then(function (result) {
            text = result.value;
            $("#text-preview").text(text);
          });
      } else if (fileType === "application/pdf") {
        // Extract text from PDF document
        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.6.347/build/pdf.worker.min.js";
        const pdfDoc = pdfjsLib.getDocument({ data: fileContent });
        pdfDoc.promise.then((pdf) => {
          const numPages = pdf.numPages;
          let textContent = "";
          for (let i = 1; i <= numPages; i++) {
            pdf.getPage(i).then((page) => {
              page.getTextContent().then((textContent) => {
                textContent += textContent.items
                  .map((item) => item.str)
                  .join("");
                $("#text-preview").text(textContent);
              });
            });
          }
        });
      } else if (fileType === "image/jpeg" || fileType === "image/png") {
        // Extract text from image using Tesseract.js
        Tesseract.recognize(fileContent, "eng", {
          logger: (m) => console.log(m),
        }).then(({ data: { text } }) => {
          $("#text-preview").text(text);
        });
      } else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        // Extract text from Excel file
        const workbook = XLSX.read(fileContent, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const textContent = XLSX.utils.sheet_to_csv(worksheet);
        $("#text-preview").text(textContent);
      }
    };
    reader.readAsArrayBuffer(file);
  });

  // Download as PDF

  // $("#download-pdf").on("click", function () {
  //   const canvas = document.getElementById("canvas");
  //   const pdf = new jsPDF();
  //   pdf.html(canvas, {
  //     html2canvas: {
  //       scale: 0.75, // Reduce the scale to improve loading time
  //     },
  //     callback: function (pdf) {
  //       pdf.setFontSize(10); // Set a smaller font size
  //       const pdfBlob = new Blob([pdf.output("blob")], {
  //         type: "application/pdf",
  //       });
  //       const url = URL.createObjectURL(pdfBlob);
  //       const a = document.createElement("a");
  //       a.href = url;
  //       a.download = "canvas_data.pdf";
  //       a.click();
  //     },
  //   });
  // });

  $("#download-pdf").on("click", function () {
    const canvas = document.getElementById("canvas");
    const pdf = new jsPDF();
    html2canvas(canvas, { scale: 2.5 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297); // Adjust width and height to fit A4 size
        pdf.setFontSize(10); // Set a smaller font size
        const pdfBlob = new Blob([pdf.output("blob")], {
          type: "application/pdf",
        });
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "canvas_data.pdf";
        a.click();
      })
      .catch(function (error) {
        console.error("Error generating PDF:", error);
      });
  });
  // $("#download-pdf").on("click", function () {
  //   const canvas = document.getElementById("canvas");
  //   const pdf = new jsPDF();
  //   html2canvas(canvas)
  //     .then((canvas) => {
  //       const imgData = canvas.toDataURL("image/png");
  //       pdf.addImage(imgData, "PNG", 0, 0);
  //       const pdfBlob = new Blob([pdf.output("blob")], {
  //         type: "application/pdf",
  //       });
  //       const url = URL.createObjectURL(pdfBlob);
  //       const a = document.createElement("a");
  //       a.href = url;
  //       a.download = "canvas_data.pdf";
  //       a.click();
  //     })
  //     .catch(function (error) {
  //       console.error("Error generating PDF:", error);
  //     });
  // });

  // Download as Text
  $("#download-text").on("click", function () {
    const canvas = document.getElementById("canvas");
    const text = canvas.innerText;
    const textBlob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(textBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas_data.txt";
    a.click();
  });

  // Download as Doc
  $("#download-doc").on("click", function () {
    const canvas = document.getElementById("canvas");
    const text = canvas.innerText;
    const docBlob = new Blob([text], { type: "application/msword" });
    const url = URL.createObjectURL(docBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas_data.doc";
    a.click();
  });

  // Download as Excel
  $("#download-excel").on("click", function () {
    const canvas = document.getElementById("canvas");
    const text = canvas.innerText;
    const worksheet = XLSX.utils.json_to_sheet([{ data: text }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
    const excelBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(excelBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas_data.xlsx";
    a.click();
  });
});
