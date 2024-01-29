'use strict'

const { BadRequestError } = require('../../core/errorResponse')

const findModelById = async ({ model, id }) => {
   try {
      return await model.findById(id)
   } catch (error) {
      throw new BadRequestError(`Error while finding record by ID: ${error.message}`)
   }
}

const createModel = async ({ model, data }) => {
   try {
      return await model.create(data)
   } catch (error) {
      throw new BadRequestError(`Error while creating record: ${error.message}`)
   }
}

const findOneModel = async ({ conditions, model, populateFields }) => {
   try {
      let query = model.findOne(conditions)
      if (populateFields && Array.isArray(populateFields)) {
         query = query.populate(populateFields)
      }
      const result = await query.exec()
      return result
   } catch (error) {
      throw new BadRequestError(`Error while finding record: ${error.message}`)
   }
}

const findModel = async ({ conditions, model, populateFields }) => {
   try {
      let query = model.find(conditions)
      if (populateFields && Array.isArray(populateFields)) {
         query = query.populate(populateFields)
      }
      const result = await query.exec()
      return result
   } catch (error) {
      throw new BadRequestError(`Error while finding record: ${error.message}`)
   }
}

const findOneModelAndUpdate = async ({ condition, payload, model, isNew = true }) => {
   try {
      return await model.findOneAndUpdate(condition, payload, { new: isNew })
   } catch (error) {
      throw new BadRequestError(`Error while updating record: ${error.message}`)
   }
}

const findModelByIdAndUpdate = async ({ id, payload, model, isNew = true }) => {
   try {
      return await model.findByIdAndUpdate({ _id: id }, payload, { new: isNew })
   } catch (error) {
      throw new BadRequestError(`Error while updating record by ID: ${error.message}`)
   }
}

module.exports = {
   findModelById,
   findOneModel,
   findOneModelAndUpdate,
   findModelByIdAndUpdate,
   createModel,
   findModel
}
