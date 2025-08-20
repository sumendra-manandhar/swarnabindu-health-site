export interface User {
  id: string;
  name: string;
  username: string;
  role: "admin" | "volunteer";
  district?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Demo users for testing
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: "admin123",
    user: {
      id: "1",
      name: "प्रशासक",
      username: "admin",
      role: "admin",
      district: "दाङ",
    },
  },
  volunteer1: {
    password: "abcd1234", // Prem Tirwari: "Pre" + "ari"
    user: {
      id: "2",
      name: "Prem Kumar Tirwari",
      username: "premkumar",
      role: "volunteer",
      district: "दाङ",
    },
  },
  volunteer2: {
    password: "abcd1234", // Hari Acharya: "Har" + "ary"
    user: {
      id: "3",
      name: "Nawaraj Dangi",
      username: "nawarajdangi",
      role: "volunteer",
      district: "दाङ",
    },
  },
  volunteer3: {
    password: "abcd1234", // Ravi Lamichane: "Rav" + "ane"
    user: {
      id: "4",
      name: "Rajan Chaudhary",
      username: "rajanchaudhary",
      role: "volunteer",
      district: "दाङ",
    },
  },
  volunteer4: {
    password: "abcd1234", // Pratap Sharma: "Pra" + "rma"
    user: {
      id: "5",
      name: "Hari Rijal",
      username: "haririjal",
      role: "volunteer",
      district: "दाङ",
    },
  },
};

export const authenticate = async (
  username: string,
  password: string
): Promise<User | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const userRecord = DEMO_USERS[username];
  if (userRecord && userRecord.password === password) {
    return userRecord.user;
  }

  return null;
};

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("auth_user");
    const expiry = localStorage.getItem("auth_expiry");

    if (!stored || !expiry) return null;

    if (Date.now() > Number.parseInt(expiry)) {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_expiry");
      return null;
    }

    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const storeUser = (user: User): void => {
  if (typeof window === "undefined") return;

  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  localStorage.setItem("auth_user", JSON.stringify(user));
  localStorage.setItem("auth_expiry", expiry.toString());
};

export const clearStoredUser = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_expiry");
};
