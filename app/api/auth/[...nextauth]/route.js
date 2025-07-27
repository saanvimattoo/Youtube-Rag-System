import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDB } from '@/config/database';
import User from '@/models/Users';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // Called when a user signs in
    async signIn({ profile }) {
      await connectToDB();
      // Check if user already exists
      const userExists = await User.findOne({ email: profile.email });
      // If not, create a new user
      if (!userExists) {
        await User.create({
          email: profile.email,
          username: profile.name, // Using the full name as the username
          image: profile.picture,
        });
      }
      // Return true to allow sign in
      return true;
    },
    // Modifies the session object
    async session({ session }) {
      await connectToDB();
      // Find the user in our database from the session email
      const user = await User.findOne({ email: session.user.email });
      // Assign the user's database ID to the session object
      session.user.id = user._id.toString();
      // Return the modified session
      return session;
    },
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
