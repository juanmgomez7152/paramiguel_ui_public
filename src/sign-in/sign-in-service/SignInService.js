//  import { environment } from "../../environment/environment";

export const signIn = async (email, password) => {
  try {
      const response = await fetch("http://127.0.0.1:3000/rest/api/authorization/sign-in", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data["message"] === "success") {
        return true;
      }else{
        return false;
      }
  } catch (error) {
      console.error("Error:", error);
      return { message: "An error occurred" };
  }
}

export const test = async () => {
  try {
      const response = await fetch("http://127.0.0.1:3000/rest/api/authorization/test");
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json())["message"];
      console.log("Response Test:", data);
      return data;
  } catch (error) {
      console.error("Error:", error);
      return { message: "An error occurred" };
  }
}