const db = require("../../config/database");
const { checkQuestions } = require("../controllers/teamDetails");
const moment=require('moment')

const teamRoles = {

  /**
   * @model [ModelName]
   * @function [FunctionName]
   * @description [Briefly describe what the model function does, including its purpose and the data layer it interacts with]
   * 
   * @notes
   * - 
   * - 
  */   
  create: async (data, trx = null) => {

    let knex = trx != null ? trx : db;
    try {

      const result = await knex("employee_details").insert(data);
      return result;
      
    } catch (error) {
      
      throw { errorCode: 'DB_ERROR', message: 'Error occurred while executing' };
    }
  },

  checkNameExists: async (name, trx = null) => {
    
    
    let knex = trx || db;
    try {
      const user = knex("employee_details")
        .where("name", name)
        .select("name")
        
      return await user;
    } catch (error) {
      throw { errorCode: 'DB_ERROR', message: 'Error checking name' };
    }
  },

  checkNumberExists:async (phone, trx = null) => {
    let knex = trx || db;
    try {
      const user =  knex("employee_details")
        .where("phone", phone)
        .select('phone')
        .limit(1);
      return await user;
    } catch (error) {
      throw { errorCode: 'DB_ERROR', message: 'Error checking Ph Number' };
    }
  },


  checkEmailExists: async (email, trx = null) => {
    let knex = trx || db;
    try {
      const userEmail =  knex("employee_details")
        .where("email", email)
        .select('email')
        .limit(1);
      return await userEmail;
    } catch (error) {
      throw { errorCode: 'DB_ERROR', message: 'Error checking Ph Number' };
    }
  },

CheckUser: async (username, trx = null) => {
    let knex = trx || db;

    try {
        const user = await knex("employee_details")
            .where("username", username)
            .select(
                "username",
                "employee_id",
                "password",
                "security_attempts",
                "last_attempt"
            );

        return user;

    } catch (error) {
        throw { errorCode: "DB_ERROR", message: "Error checking username" };
    }
},




  getQuestions:async(id,trx=null)=>{
         let knex=trx!=null?trx:db;
         try {
            let result=knex('security_questions')
            result.select('qid')
            result.select('question')
            result.where('qid',id)
            return await result
         } catch (error) {
            throw {errorCode:'DB_Error',message:'error occured while executing'}
         }
    },getAnswers:async(id,trx=null)=>{
        let knex=trx!=null?trx:db;
        try {
            let result=knex('security_answers')
            result.select('question_id')
            result.select('answer')
            result.where('question_id',id)
            return await result
        } catch (error) {
             throw {errorCode:'DB_Error',message:'error occured while executing'}
        }
    },


 resetSecurityQuestions: async (id, trx = null) => {
    let knex = trx != null ? trx : db;

    try {
        console.log("resetSecurityQuestions ID:", id);

        const result = await knex("employee_details")
            .where("employee_id", id)
            .update({
                security_attempts: 0,
                last_attempt: moment().format()
            });

        return result;

    } catch (error) {
        throw { errorCode: "DB_Error", message: error.message };
    }
},


increaseAttempt: async (id, newAttempts, last, trx = null) => {
    let knex = trx != null ? trx : db;

    try {
        console.log("increaseAttempt running", id);

        const updated = await knex("employee_details")
            .where("employee_id", id)
            .update({
                security_attempts: newAttempts,
                last_attempt: last
            });

        console.log("Updated rows:", updated);
        return updated;

    } catch (error) {
        throw { errorCode: "DB_Error", message: error.message };
    }
},

getRandomQuestions: async (trx = null) => {
    let knex = trx != null ? trx : db;

    return await knex("security_questions")
        .select("qid", "question")
        .orderByRaw("RAND()")
        .limit(3);
},

updatePassword: async (username, password, trx = null) => {
    let knex = trx != null ? trx : db;

    const result =  knex("employee_details")
        .where('username', username)
        .update({"password": password, })
        return await result
        
},


  


  /**
   * @model [ModelName]
   * @function [FunctionName]
   * @description [Briefly describe what the model function does, including its purpose and the data layer it interacts with]
   * 
   * @notes
   * - 
   * - 
  */   
  getAll: async (trx = null) => {
    
    let knex = trx != null ? trx : db;
    try {

      const result = knex('employee_details');

      result.select('employee_id');
      result.select('name');

      return await result;

    } catch (error) {
      throw { errorCode: 'DB_ERROR', message: 'Error occurred while executing' };
    }
  },
  getEmployeeById:async(id,trx = null)=>{
   let knex = trx != null ? trx : db;
   try {
    let result=knex('employee_details')
    result.select('employee_id','name','email')
    result.where('employee_id',id)
    return await result
   } catch (error) {
    throw { errorCode: 'DB_ERROR', message: 'Error occurred while executing' };
   }
},

  getEmployeeByName: async(name, trx = null)=>{
    let knex = trx != null ? trx : db;
    try {
      let result = knex('employee_details')
      result.select('employee_id', 'name')
      result.where('name', name)
      return await result
    } catch (error) {
      throw { errorCode: 'DB_ERROR', message: 'Error occurred while executing' };
    }
  }




}

module.exports = teamRoles;