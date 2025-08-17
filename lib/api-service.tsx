export class ApiService {
  static async createRegistration(registrationData: any) {
    try {
      alert("api calling");
      const response = await fetch(
        "https://health-service.gyanbazzar.com/registrations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      if (!response.ok) {
        console.error("API Error:", response.statusText);
        return { data: null, error: response.statusText };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      console.error("Network/API Error:", error);
      return { data: null, error };
    }
  }
}
