// jest.teardown.js
import mongoose from 'mongoose';

export default async () => {
  await mongoose.disconnect();
};