const Joi = require("../utils/customJoi");
const bcrypt = require("bcrypt");
const moment=require('moment')

const teamRoles = require("../models/teamRoles");

const teamDetails = {
  /**
   * @function [FunctionName]
   * @description [Briefly describe what the controller function does, including its purpose]
   *
   * @param {Request} req - The incoming HTTP request object containing any data, headers, or parameters.
   *    - [Describe any specific properties of the request object that are used in this function]
   * @param {Response} res - The HTTP response object used to send back the result to the client.
   * @param {NextFunction} next - The next middleware function to call if the current function doesn't handle the response.
   *
   * @example
   * // Example request to create a new user:
   * POST /createRole { name: 'Test One' }
   *
   * @notes
   * -
   * -
   **/
  createRole: async (req, res) => {
    const formData = Joi.object({
      name: Joi.string().min(2).max(100).required().label("Employee name"),
      username: Joi.string().min(4).max(100).required().label("Username"),
      email: Joi.string().email().required().label("Email"),
      phone: Joi.string().min(10).max(20).required().label("Phone number"),
      password: Joi.string().min(8).max(20).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/).required().label("Password"),
      salary: Joi.number().precision(2).positive().required().label("Salary"),
      designation: Joi.string().max(100).required().label("Designation"),
      role: Joi.string().max(50).optional().label("Role"),
      address: Joi.string().max(255).optional().label("Address"),
      work_location: Joi.string().max(100).optional().label("Work location"),
      experience: Joi.number()
        .precision(1)
        .min(0)
        .optional()
        .label("Experience"),
    });

    // Validate File
    const validation = formData.validate(req.body, {
      errors: { wrap: { label: false } },
      abortEarly: false,
    });

    // Validations
    if (validation.error) {
      let errorDetails = [];
      if (validation.error) {
        errorDetails = validation.error.details.map((err) => ({
          field: err.context.key,
          message: err.message,
        }));
      }

      return res.status(422).json({
        message: errorDetails,
      });
    } else {
      try {
        //checking the user name is exist or not.
        const nameExists = await teamRoles.checkNameExists(req.body.name);
        let password = req.body.password;
        let hashedPassword = await bcrypt.hash(password, 10);
        //console.log(hashedPassword);

        if (nameExists.length > 0) {
          return res.status(400).json({
            message: "Name already exists. Please choose another.",
          });
        }

        const phNumberExists = await teamRoles.checkNumberExists(
          req.body.phone
        );
        if (phNumberExists.length > 0) {
          return res.status(400).json({
            message: "Phone number already exists. Please choose another",
          });
        }

        const emailExists = await teamRoles.checkEmailExists(req.body.email);
        if (emailExists.length > 0) {
          return res.status(400).json({
            message: "Email already exists. Please choose another",
          });
        }

        let roleData = { ...req.body, password: hashedPassword };

        const allRoles = await teamRoles.create(roleData);

        return res.status(200).json({
          message: "Created Successfully",
        });
      } catch (error) {
        return res.status(409).json({
          message: error.message,
        });
      }
    }
  },

  /**
   * @function [FunctionName]
   * @description [Briefly describe what the controller function does, including its purpose]
   *
   * @param {Request} req - The incoming HTTP request object containing any data, headers, or parameters.
   *    - [Describe any specific properties of the request object that are used in this function]
   * @param {Response} res - The HTTP response object used to send back the result to the client.
   * @param {NextFunction} next - The next middleware function to call if the current function doesn't handle the response.
   *
   * @example
   * // Example request to create a new user:
   * GET /getAllRoles
   *
   * @notes
   * -
   * -
   **/
  getAllRoles: async (req, res) => {
    let prams = req.query;
    if (Object.keys(prams).length === 0) {
      try {
        let records = [];
        console.log("role start");

        const allRoles = await teamRoles.getAll();
        console.log("all roles:", allRoles);

        if (allRoles.length > 0) {
          records = [...allRoles];
        }

        return res.status(200).json({
          records: records,
        });
      } catch (error) {
        return res.status(409).json({
          message: error.message,
        });
      }
    } else {
      return res.status(404).send("Page not found");
    }
  },
  getRoleById: async (req, res) => {
    try {
      const { id } = req.params;
      let data = await teamRoles.getEmployeeById(id);

      if (!data || data.length === 0) {
       // return res.status(404).json({ message: `No role found for ID: ${id}` });
       throw {errorCode:'VALID_ERROR',message:'no role found for id'}
      }
      return res.status(200).json({ message: data });
    } catch (error) {
      console.error("Error fetching role by ID:", error);
      if(error.errorCode=='VALID_ERROR'){
        return res.status(422).json({message:error.message})
      }else{
        return res.status(409).json({message:error.message})
      }
    }
  },

  getEmployeeByName: async (req, res) => {
    try {
      const { name } = req.params;
      let data = await teamRoles.getEmployeeByName(name);
      if (!data || data.length === 0) {
      
        throw {errorCode: 'VALID_ERROR', message:'No role found for name'}
      }
      return res.status(200).json({ message: data });
    } catch (error) {
      console.error("Error fetching role by name:", error);
      if(error.errorCode === 'VALID_ERROR'){
        return res.status(422).json({message:error.message})
      }else{
        return res.status(409).json({message:error.message})
      }
    }
  },

checkQuestions: async (req, res) => {
    // Joi validation
    let formData = Joi.object({
        username: Joi.string().min(3).max(16).required(),
        answers: Joi.array().items(
            Joi.object({
                qid: Joi.number().required(),
                answer: Joi.string().min(3).pattern(/^[a-zA-Z0-9]+$/).required()
            })
        ).required()
    });

    let { error } = formData.validate(req.body, {
        errors: { wrap: { label: false } },
        abortEarly: false
    });

    if (error) {
        let errorDetails = error.details.map(err => ({
            field: err.context.key,
            message: err.message
        }));
        return res.status(422).json({ data: errorDetails });
    }

    try {
        const { username, answers } = req.body;

        console.log("Request:", req.body);


        const user = await teamRoles.CheckUser(username);
        if (user.length === 0) {
            throw { errorCode: "VALID_ERROR", message: "user not found" };
        }

        const employee = user[0];
        console.log("Employee:", employee);

      
        if (employee.security_attempts >= 3 && employee.last_attempt) {
            const minutesPassed = moment().diff(employee.last_attempt, "minutes");

            if (minutesPassed < 5) {
                return res.status(429).json({
                    message: `Your account is locked. You can try again after ${5 - minutesPassed} minutes`
                });
            } else {
                await teamRoles.resetSecurityQuestions(employee.employee_id);
            }
        }

   
        for (let i = 0; i < answers.length; i++) {
            let qid = answers[i].qid;

            let dbQuestions = await teamRoles.getQuestions(qid);
            let dbAnswer = await teamRoles.getAnswers(qid);

            if (dbQuestions.length === 0) {
                throw { errorCode: "VALID_ERROR", message: "question not found" };
            }

            if (dbAnswer.length === 0) {
                throw { errorCode: "VALID_ERROR", message: "answer not found" };
            }

            if (dbAnswer[0].answer !== answers[i].answer) {
                await teamRoles.increaseAttempt(
                    employee.employee_id,
                    employee.security_attempts + 1,
                    moment().format()
                );

                return res.status(401).json({
                    message: "Incorrect answer. Please check and try again carefully."
                });
            }
        }

       
        await teamRoles.resetSecurityQuestions(employee.employee_id);
        return res.status(200).json({ message: "answers matched" });

    } catch (error) {
        if (error.errorCode === "VALID_ERROR") {
            return res.status(422).json({ message: error.message });
        }
        return res.status(409).json({ error: error.message });
    }
},

getRandomQuestions: async (req, res) => {
    try {
        const questions = await teamRoles.getRandomQuestions();
        return res.status(200).json({ questions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch random questions" });
    }
},

  
// checkQuestions: async (req, res) => {
//   // 1. Validate input
//   const formData = Joi.object({
//     username: Joi.string().min(3).max(16).required(),
//     answers: Joi.array().items(
//       Joi.object({
//         qid: Joi.number().required(),
//         answer: Joi.string()
//           .min(3)
//           .required()
//           .pattern(/^[a-zA-Z0-9]+$/),
//       })
//     ).required()
//   });

//   const { error } = formData.validate(req.body, {
//     errors: { wrap: { label: false } },
//     abortEarly: false,
//   });

//   if (error) {
//     return res.status(403).json({ message: "Invalid input", details: error.details });
//   }

//   const { username, answers } = req.body;

//   try {
//     // 2. Check user exists
//     const user = await teamRoles.CheckUser(username);

//     if (!user || user.length === 0) {
//       return res.status(422).json({ message: "User Not Found" });
//     }

//     const employee = user[0];

//     // Convert security_attempts to number
//     let attempts = Number(employee.security_attempts) || 0;
//     console.log("Current attempts:", attempts);

//     // 3. Lockout Check
//     if (attempts >= 3 && employee.last_attempt) {
//       const minutesPassed = moment().diff(employee.last_attempt, "minutes");

//       if (minutesPassed < 10) {
//         return res.status(429).json({
//           message: `Your account is locked. Try again after ${10 - minutesPassed} minutes.`,
//         });
//       }

//       // Lock expired → reset attempts
//       await teamRoles.resetSecurityQuestions(employee.employee_id);
//       attempts = 0;
//     }

//     // 4. Check each answer
//     for (let i = 0; i < answers.length; i++) {
//       console.log('hii');
      
//       const { qid, answer } = answers[i];

//       const dbQuestions = await teamRoles.getQuestions(qid);
//       const dbAnswer = await teamRoles.getAnswers(qid);

//       if (dbQuestions.length === 0) {
//         return res.status(422).json({ message: "Question not found" });
//       }

//       if (dbAnswer.length === 0) {
//         return res.status(422).json({ message: "Answer not found" });
//       }

//       if (dbAnswer[0].answer !== answer) {
//         // ❗ IMPORTANT FIX:
//         // Increase attempts BEFORE sending response
//         const newAttempts = attempts + 1;

//         await teamRoles.increaseAttempt(
//           employee.employee_id,
//           newAttempts,
//           moment().format()
//         );

//         console.log("Updated attempts:", newAttempts);

//         return res.status(401).json({
//           message: "Incorrect answer. Please try again.",
//         });
//       }
//     }

//     // 5. If all answers correct → reset attempts
//     await teamRoles.resetSecurityQuestions(employee.employee_id);

//     return res.status(200).json({ message: "All answers matched successfully" });

//   } catch (error) {
//     console.error("DB_Error", error);
//     return res.status(500).json({ message: "Database error occurred" });
//   }
// },


  createNewPassword: async (req, res) => {
        let formvalidation = Joi.object({
            username: Joi.string().min(3).max(16).required(),
            newPassword: Joi.string().min(6).max(15).pattern(/^[A-Z][a-zA-Z0-9]+$/).required(),
            confirmPassword: Joi.string().min(6).max(15).pattern(/^[A-Z][a-zA-Z0-9]+$/).required().valid(Joi.ref('newPassword'))
        })
        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        let errorDetails = []
        if (error) {
            errorDetails = error.details.map(err => ({
                field: err.context.key,
                message: err.message
            }))
            return res.status(422).json({ data: errorDetails })
        } else {
            try {
                let { username, newPassword, confirmPassword } = req.body

                const user = await teamRoles.CheckUser(username)
                let compare = await bcrypt.compare(newPassword, user[0].password)
                console.log(compare);
                if (compare) {
                    throw { errorCode: 'VALID_ERROR', message: 'old password and new password cannot be same' }
                }

                if (user.length == 0) {
                    throw { errorCode: 'VALID_ERROR', message: 'cannot found the user' }
                }
                const hashedPassword = await bcrypt.hash(newPassword, 10)
                let updatePassword = await teamRoles.updatePassword(username, hashedPassword)
                if (updatePassword.length == 0) {
                    throw ({ errorCode: 'VALID_ERROR', message: 'cannot update password' })
                }
                return res.status(200).json({ data: { username, newPassword }, message: 'password updated' })


            } catch (error) {
                if (error.errorCode === 'validation') {
                    return res.status(422).json({
                        message: error.message
                    })
                } else {
                    return res.status(409).json({
                        error: error.message
                    })
                }
            }
        }
    },

    updateProfile: async(req, res)=>{
          let formvalidation = Joi.object({
            name: Joi.string().min(3).max(16).required(),
            email: Joi.string().email().required(),
            phone: Joi.string().min(10).max(20).required(),
        })

        let { error } = formvalidation.validate(req.body, { errors: { wrap: { label: false } }, abortEarly: false })
        if (error) {
        let errorDetails = error.details.map(err => ({
            field: err.context.key,
            message: err.message
        }));
        return res.status(422).json({ data: errorDetails });
       }
      
       try {
        const {id} = req.params;
        const  { name, email, phone} = req.body
        let nameResult = await teamRoles.checkNameExists(name)
        if(!nameResult){
           throw {errorCode: "VALID_ERROR", message:'No Name Found'}
        }

        let emailResult = await teamRoles.checkEmailExists(email)
        if(!emailResult){
           throw {errorCode: "VALID_ERROR", message:'No Email Found'}
        }

        let phoneResult = await teamRoles.checkNumberExists(phone)
        if(!phoneResult){
            throw {errorCode: "VALID_ERROR", message:'No Number Found'}
        }
      
      
        await teamRoles.updateProfile({ id, name, email, phone });

        return res.status(200).json({message : `Profile updated successfully`, data: { name, email, phone }})
       } catch (error) {
            if (error.errorCode === "VALID_ERROR") {
            return res.status(422).json({ message: error.message });
        }
        return res.status(409).json({ error: error.message });
       }    
    },


  checkUser: async(req, res)=>{
    try {
       const {username} = req.body
       let data = await teamRoles.CheckUser(username)
       if(!data || data.length === 0){
         throw {errorCode: "VALID_ERROR", message:'No role found for username'}
       }
       return res.status(200).json({message: data})
    } catch (error) {
      console.error("error checking by username")
      if(error.errorCode === 'VALID_ERROR'){
        return res.status(422).json({message: error.message})
      }else{
        return res.status(409).json({message: error.message})
      }
    }
  }
};

module.exports = teamDetails;
