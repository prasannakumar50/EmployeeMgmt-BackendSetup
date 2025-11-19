const db = require("../../config/database");
const { checkQuestions } = require("../controllers/teamDetails");
const moment = require("moment");

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
      throw {
        errorCode: "DB_ERROR",
        message: "Error occurred while executing",
      };
    }
  },

  checkNameExists: async (name, trx = null) => {
    let knex = trx || db;
    try {
      const user = knex("employee_details").where("name", name).select("name");

      return await user;
    } catch (error) {
      throw { errorCode: "DB_ERROR", message: "Error checking name" };
    }
  },

  checkNumberExists: async (phone, trx = null) => {
    let knex = trx || db;
    try {
      const user = knex("employee_details")
        .where("phone", phone)
        .select("phone")
        .limit(1);
      return await user;
    } catch (error) {
      throw { errorCode: "DB_ERROR", message: "Error checking Ph Number" };
    }
  },

  checkEmailExists: async (email, trx = null) => {
    let knex = trx || db;
    try {
      const userEmail = knex("employee_details")
        .where("email", email)
        .select("email")
        .limit(1);
      return await userEmail;
    } catch (error) {
      throw { errorCode: "DB_ERROR", message: "Error checking Ph Number" };
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

  getQuestions: async (id, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("security_questions");
      result.select("qid");
      result.select("question");
      result.where("qid", id);
      return await result;
    } catch (error) {
      throw { errorCode: "DB_Error", message: "error occured while executing" };
    }
  },
  getAnswers: async (id, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("security_answers");
      result.select("question_id");
      result.select("answer");
      result.where("question_id", id);
      return await result;
    } catch (error) {
      throw { errorCode: "DB_Error", message: "error occured while executing" };
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
          last_attempt: moment().format(),
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
          last_attempt: last,
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

    const result = knex("employee_details")
      .where("username", username)
      .update({ password: password });
    return await result;
  },

  updateProfile: async ({ id, name, email, phone, image_url }, trx = null) => {
    console.log("Updating ID:", id);
    const knex = trx ? trx : db;

    const result = knex("employee_details")
      .where("employee_id", id)
      .update({ name, email, phone, image_url });
    return await result;
  },

  getTodayAttendence: async (id, today, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("emp_attendance");
      // result.select('id')
      result.select("login_time");
      result.select("logout_time");
      result.where("employee_id", id);
      result.andWhere("date", today);
      return await result;
    } catch (error) {
      throw { errorCode: "DB_Error", message: error.message };
    }
  },
  addAttendence: async (id, data, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("emp_attendance");
      result.where("employee_id", id);
      result.insert(data);
      return await result;
    } catch (error) {
      throw { errorCode: "DB_Error", message: error.message };
    }
  },
  updateAttendence: async (id, today, data, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("emp_attendance");
      result.where("employee_id", id);
      result.andWhere("date", today);
      result.update(data);
      return await result;
    } catch (error) {
      throw { errorCode: "DB_Error", message: error.message };
    }
  },

  leave: async (id, data, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("leave_requests");
      result.where("employee_id", id);
      result.insert(data);
      return await result;
    } catch (error) {
      throw { errorCode: "DB_Error", message: error.message };
    }
  },
  getLeaveById: async (id, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("leave_requests");
      result.where("id", id);
      result.select("employee_id");
      result.select("start_date");
      result.select("end_date");
      result.select("total_days");
      result.select("reason");
      result.select("status");
      return await result;
    } catch (error) {
      throw { errorCode: "DB_Error", message: error.message };
    }
  },
  leaveStatus: async (id, data, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("leave_requests");
      result.where("id", id);
      result.update(data);
      return await result;
    } catch (error) {
      throw { errorCode: "DB_Error", message: error.message };
    }
  },
  updateLeaves: async (id, data, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("employee_details");
      result.where("employee_id", id);
      result.update(data);
      return await result;
    } catch (error) {
      throw { errorCode: "DB_Error", message: error.message };
    }
  },
  checkOverlap: async (id, start_date, end_date, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("leave_requests");
      result.select("id");
      result.select("total_days");
      result.where("employee_id", id);
      result.whereIn("status", ["Approved", "pending"]);
      result.where("end_date", ">=", start_date);
      result.andWhere("start_date", "<=", end_date);
      return await result;
    } catch (error) {
      throw { errorCode: "DB_Error", message: error.message };
    }
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
      const result = knex("employee_details");

      result.select("employee_id");
      result.select("name");

      return await result;
    } catch (error) {
      throw {
        errorCode: "DB_ERROR",
        message: "Error occurred while executing",
      };
    }
  },
  getEmployeeById: async (id, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("employee_details");
      result.select(
        "employee_id",
        "name",
        "email",
        "leaves_taken",
        "remaining_leaves",
        "total_LEAVES"
      );
      result.where("employee_id", id);
      return await result;
    } catch (error) {
      throw { errorCode: "DB_ERROR", message: error.message };
    }
  },

  getEmployeeByName: async (name, trx = null) => {
    let knex = trx != null ? trx : db;
    try {
      let result = knex("employee_details");
      result.select("employee_id", "name");
      result.where("name", name);
      return await result;
    } catch (error) {
      throw {
        errorCode: "DB_ERROR",
        message: "Error occurred while executing",
      };
    }
  },


   verifyVendorEmail: async (email, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('dealers')
            result.select('name')
            result.where('email', email)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
    verifyVendorContact: async (contact, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('dealers')
            result.select('name')
            result.where('phone_number', contact)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
  
  insertDealer: async (data, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('dealers')
            result.insert(data)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },

      getDealersByEmployeeId: async (id, trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('dealers')
            result.select('dealer_id', 'name', 'organisation', 'location', 'email', 'phone_number')
            result.where('employee_id', id)
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },

    getAllDealers: async (trx = null) => {
        let knex = trx != null ? trx : db;
        try {
            let result = knex('dealers')
            result.select('dealer_id', 'name', 'organisation', 'location', 'email', 'phone_number')
            return await result
        } catch (error) {
            throw { errorCode: 'DB_Error', message: error.message }
        }
    },
};

module.exports = teamRoles;
