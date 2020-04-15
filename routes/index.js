const router = require('express').Router();
const controller = require('../controllers');


router.get('/api/messages',(req, res) => {
  controller.getMessages(req, res);
});

router.post('/api/message', (req, res) => {
  controller.postMessage(req, res);
});

router.delete('/api/message',(req, res) => {
  controller.deleteMessage(req, res);
});

module.exports = router;
