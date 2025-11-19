const express = require("express");
const router = express.Router();
const teamDetails = require("../../controllers/teamDetails"); 
const fileupload = require("../../utils/fileupload");
const copyFile =require("../../utils/copyFile")

// POST /0.1/createRole
router.post("/createRole", teamDetails.createRole);
router.post("/username", teamDetails.checkUser);
router.post("/answers", teamDetails.checkQuestions);
router.put("/updatePwd", teamDetails.createNewPassword)
router.put("/addLogin", teamDetails.employeeAttendence)
router.put("/addLogout",teamDetails.updateLogout)
router.post("/leaveRequest/:id", teamDetails.leaveRequest)
router.put('/leave/:id',teamDetails.leaveApproval)
router.post('/addDealer/:id', teamDetails.addDealer)
router.get('/getDealer/:id', teamDetails.getDealersByEmpId)
router.get('/getAllDealers', teamDetails.getAllDealers)

router.put(
  "/profileUpdate/:id",
  fileupload.single("image"),   
  teamDetails.updateProfile
);

// GET /0.1/getAllRoles
router.get("/getAllRoles", teamDetails.getAllRoles);
router.get("/getrole/:id",teamDetails.getRoleById);
router.get("/getName/:name", teamDetails.getEmployeeByName);
router.get("/getQuestions", teamDetails.getRandomQuestions);


module.exports = router;
