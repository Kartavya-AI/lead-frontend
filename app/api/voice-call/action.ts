"use server";
import axios from "axios";

const api_url = "https://deepgram-api-977121587860.asia-south2.run.app/api/calls";

export const makeCall = async (to_number: string) => {
  try {
    const response = await axios.post(api_url, { to: to_number });
    return response.data;
  } catch (error) {
    console.error("Error making call:", error);
    throw error;
  }
};
