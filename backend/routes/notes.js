const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');

//Route 1:Get all Notes using: GET "/api/auth/fetchallnotes",Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes)
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error occurred!');
  }
})
//Route 2:Add a new Note using: POST "/api/notes/addnote",Login required
router.post('/addnote', fetchuser, [
  body('title', 'Enter a valid title').isLength({ min: 3 }),
  body('description', 'description must be atlest 5 characters').isLength({ min: 5 })], async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //if there are errors,return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title, description, tag, user: req.user.id
      })
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal server error occurred!');
    }
  })

//Route3:Update an existing Note using: PUT "/api/note/updatenote",Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
 try{
  const { title, description, tag } = req.body;
  //create a newNote object
  const newNote = {};
  if (title) { newNote.title = title };
  if (description) { newNote.description = description };
  if (tag) { newNote.tag = tag };

  //find the note to be updated & update it
  let note = await Note.findById(req.params.id);
  if (!note) { return res.status(404).send('Not found') }

  if (note.user.toString() !== req.user.id) {
    return res.status(401).send('Not allowed');
  }
  note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, 
  { new: true })
  res.json({ note });
 }
 catch(error){
  console.error(error.message);
  res.status(500).send('Internal server error occurred!');
}
})

//Route4:Delete an existing Note using:DELETE "/api/note/deletenote",Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  //find the note to be delete & delete it
  try {
    let note = await Note.findById(req.params.id);
    if (!note) { return res.status(404).send('Not found') }
  //Allow deletion only if user owns this Note 
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send('Not allowed');
    }
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({ 'Success': 'note has been deleted', notes: note });
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error occurred!');
  }
})

module.exports = router;