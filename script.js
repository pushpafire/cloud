const express = require("express");
const { Dropbox } = require("dropbox");
const fetch = require("isomorphic-fetch");
const multer = require("multer");
const upload = multer();
const path = require("path");

const app = express();

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

const dropbox = new Dropbox({
  accessToken:
    "sl.CBGmvEKZ-fH3VyeCkwF-G9cMKzmwr2-ZBa6oxusV1nDSbslLje0KjZS5GAgb346w-M8Inuxme8AQrwuy5kUbCYeGnu89u3bB0dsjWE_YogUKkUP9YYvbIl92enr7W4XyqaXJezV2PbUNjT2Tmy_h5QI", // Replace with your Dropbox access token
  fetch,
});


app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dropbox File Management</title>
        <link rel="stylesheet" href="/css/styles.css">
    </head>
    <body>
        <h1>Football Club Portal</h1>
        <div>
            <button onclick="showForm('upload-file')">Upload a File</button>
            <button onclick="showForm('download-file')">Download a File</button>
        </div>

        <div id="forms">
            <!-- Upload Form -->
            <form id="upload-file" action="/upload-file" method="post" enctype="multipart/form-data" style="display:none;">
                <h2>Upload a File</h2>
                <label for="file">Choose file:</label>
                <input type="file" id="file" name="file" required><br><br>
                <button type="submit">Upload</button>
            </form>

            <!-- Download Form -->
            <form id="download-file" action="/download-file" method="get" style="display:none;">
                <h2>Download a File</h2>
                <label for="fileName">File Name:</label>
                <input type="text" id="fileName" name="fileName" required><br><br>
                <button type="submit">Download</button>
            </form>
        </div>

        <script>
            function showForm(formId) {
                document.querySelectorAll('#forms form').forEach(form => form.style.display = 'none');
                document.getElementById(formId).style.display = 'block';
            }
        </script>
    </body>
    </html>
    `);
});

app.post("/upload-file", upload.single("file"), (req, res) => {
  const fileContent = req.file.buffer;
  dropbox
    .filesUpload({ path: `/${req.file.originalname}`, contents: fileContent })
    .then(() => res.send("File uploaded to Dropbox"))
    .catch((err) => res.status(500).send(err.message));
});

app.get("/download-file", (req, res) => {
  const fileName = req.query.fileName;
  dropbox
    .filesDownload({ path: `/${fileName}` })
    .then((response) => {
      res.set({
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${response.result.name}"`,
      });
      res.send(response.result.fileBinary);
    })
    .catch((err) => res.status(500).send(err.message));
});

app.listen(3000, () => {
  console.log("Dropbox server is running on port 3000");
});
