const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('@apollo/server');

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        if (!context.user) {
          throw new AuthenticationError('Not authenticated');
        }
  
        try {
          const user = await User.findById(context.user._id);
          return user;
        } catch (error) {
          throw new Error('Error fetching user');
        }
      },
    },

    Mutation: {
      login: async (parent, { email, password }) => {
        try {
          const user = await User.findOne({ email });
  
          if (!user || !(await user.isCorrectPassword(password))) {
            throw new AuthenticationError('Incorrect email or password');
          }
  
          const token = signToken(user);
  
          return { token, user };
        } catch (error) {
          throw new Error('Error during login');
        }
      },
      addUser: async (parent, { username, email, password }) => {
        try {
          const user = await User.create({ username, email, password });
          const token = signToken(user);
  
          return { token, user };
        } catch (error) {
          throw new Error('Error during user creation');
        }
      },
      saveBook: async (parent, { authors, description, title, bookId, image, link }, context) => {
        if (!context.user) {
          throw new AuthenticationError('Not authenticated');
        }
  
        try {
          const updatedUser = await User.findByIdAndUpdate(
            context.user._id,
            {
              $addToSet: {
                savedBooks: { authors, description, title, bookId, image, link },
              },
            },
            { new: true }
          );
  
          return updatedUser;
        } catch (error) {
          throw new Error('Error saving book');
        }
      },
      removeBook: async (parent, { bookId }, context) => {
        if (!context.user) {
          throw new AuthenticationError('Not authenticated');
        }
  
        try {
          const updatedUser = await User.findByIdAndUpdate(
            context.user._id,
            {
              $pull: {
                savedBooks: { bookId },
              },
            },
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