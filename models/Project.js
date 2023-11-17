const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  title: String,
  short_desc: String,
  image: String,
  desc: String,
  client: String,
  category: String,
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model("Project", ProjectSchema)

module.exports = Project