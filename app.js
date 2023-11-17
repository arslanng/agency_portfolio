const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Project = require("./models/Project");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const methodOverride = require("method-override");
const nodemailer = require("nodemailer");
const app = express();

mongoose
  .connect("mongodb://localhost/agency-project")
  .then((x) => console.log("db connected"));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);

app.post("/project", async (req, res, next) => {
  const uploadDIR = "public/uploads";

  if (!fs.existsSync(uploadDIR)) {
    fs.mkdirSync(uploadDIR);
  }
  let time = Date.now();
  let uploadedImage = req.files.image;
  let uploadPath = __dirname + "/public/uploads/" + time + uploadedImage.name;

  uploadedImage.mv(uploadPath, async () => {
    await Project.create({
      ...req.body,
      image: "/uploads/" + time + uploadedImage.name,
    });
  });

  res.redirect("/");
});

app.get("/", async (req, res) => {
  const projects = await Project.find({}).sort("-dateCreated");
  res.render("index", {
    projects,
  });
});

app.put("/project/:id", async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id });
  project.title = req.body.title;
  project.short_desc = req.body.short_desc;
  project.desc = req.body.desc;
  project.client = req.body.client;
  project.category = req.body.category;
  project.save();
  res.redirect("/");
});

app.delete("/project/:id", async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id });
  let deletedImage = __dirname + "/public" + project.image;
  if (fs.existsSync(deletedImage)) {
    fs.unlinkSync(deletedImage);
  }

  await Project.findByIdAndDelete(req.params.id);

  res.redirect("/");
});

app.post("/contact", async (req, res) => {
  console.log(req.body);
  const outputMessage = `
    <h1>Mail Details</h1> 
    <ul> 
        <li>Name: ${req.body.name}</li> 
        <li>Email: ${req.body.email}</li> 
    </ul> 
    <h1>Message</h1> 
    <p>${req.body.message}</p>
  `;

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", //  gmaile yönlendiriyoruz.
    port: 465, //  portu 465 e ayarlıyoruz.
    secure: true, //  true for 465, false for other ports
    auth: {
      user: "drmuratgokduman@gmail.com", //  gmail accont: maili gönderecek olan adres
      pass: "eqocuuyuqcrxxyhc", //  gmail password yerine google account içinde güvenlik kısmında uygulama şifrelerine girilir ve uygulama şifresi oluşturulur. uygulama: posta cihaz: windows bilgisayar
    },
  });

  let info = await transporter.sendMail({
    from: `"Agency Portfolio Project From" <drmuratgokduman@gmail.com>`,
    to: "drmuratgokduman@gmail.com",
    subject: "Agency Portfolio Project Contact Form New Message ✔",
    html: outputMessage,
  });

  res.status(200).redirect("/");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı`);
});
