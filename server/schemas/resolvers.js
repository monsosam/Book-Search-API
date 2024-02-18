const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('Incorrect email or password');
        }
  
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new AuthenticationError('Incorrect password');
        }
        
        const token = signToken(user);
        return { token, user };

      } catch (error) {
        throw new Error('Error during login');
      }
    },

    addUser: async (_, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
  
        return { token, user };
      } catch (error) {
        throw new Error('Error during user creation');
      }
    },

    saveBook: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      try {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;

      } catch (error) {
        throw new Error('Error saving book');
      }
    },

    removeBook: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      try {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { input } } },
          { new: true }
        );          
        return updatedUser;

      } catch (error) {
        throw new Error('Error removing book');
      }
    },
  },
};
  
  module.exports = resolvers;