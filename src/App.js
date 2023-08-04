import { useState, useReducer, useEffect } from "react";
import "./App.css";
import ExpenseForm from "./components/ExpenseForm/ExpenseForm";
import ExpenseInfo from "./components/ExpenseInfo/ExpenseInfo";
import ExpenseList from "./components/ExpenseList/ExpenseList";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  // Your Firebase configuration
  apiKey: "AIzaSyD3rLl_KdfMBF-COtYekWJojIxw2bZaW8U",
  authDomain: "expencess-4bfe1.firebaseapp.com",
  projectId: "expencess-4bfe1",
  storageBucket: "expencess-4bfe1.appspot.com",
  messagingSenderId: "768100094202",
  appId: "1:768100094202:web:e47a030986d24e5f4df943",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const reducer = (state, action) => {
  const { payload } = action;
  switch (action.type) {
    case "SET_EXPENSES": {
      return {
        expenses: payload.expenses,
      };
    }
    case "ADD_EXPENSE": {
      return {
        expenses: [payload.expense, ...state.expenses],
      };
    }
    case "REMOVE_EXPENSE": {
      return {
        expenses: state.expenses.filter((expense) => expense.id !== payload.id),
      };
    }
    case "UPDATE_EXPENSE": {
      const expensesDuplicate = state.expenses;
      expensesDuplicate[payload.expensePos] = payload.expense;
      return {
        expenses: expensesDuplicate,
      };
    }
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, { expenses: [] });
  const [expenseToUpdate, setExpenseToUpdate] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "expenses"));
        const expenses = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch({ type: "SET_EXPENSES", payload: { expenses } });
      } catch (error) {
        console.error("Error fetching expenses: ", error);
      }
    };

    fetchExpenses();
  }, []);

  const addExpense = async (expense) => {
    try {
      const docRef = await addDoc(collection(db, "expenses"), expense);
      const newExpense = { id: docRef.id, ...expense };
      dispatch({ type: "ADD_EXPENSE", payload: { expense: newExpense } });
      toast.success("Expense added successfully.");
    } catch (error) {
      console.error("Error adding expense: ", error);
      toast.error("Failed to add expense.");
    }
  };

  const deleteExpense = async (id) => {
    try {
      await deleteDoc(doc(db, "expenses", id));
      dispatch({ type: "REMOVE_EXPENSE", payload: { id } });
      toast.success("Expense deleted successfully.");
    } catch (error) {
      console.error("Error deleting expense: ", error);
      toast.error("Failed to delete expense.");
    }
  };

  const resetExpenseToUpdate = () => {
    setExpenseToUpdate(null);
  };

  const updateExpense = async (expense) => {
    const expensePos = state.expenses.findIndex((exp) => exp.id === expense.id);

    if (expensePos === -1) {
      return false;
    }

    try {
      const expenseRef = doc(db, "expenses", expense.id);
      await updateDoc(expenseRef, expense);
      dispatch({ type: "UPDATE_EXPENSE", payload: { expensePos, expense } });
      toast.success("Expense updated successfully.");
      return true;
    } catch (error) {
      console.error("Error updating expense: ", error);
      toast.error("Failed to update expense.");
      return false;
    }
  };

  return (
    <>
      <ToastContainer />
      <h2 className="mainHeading">Expense Tracker</h2>
      <div className="App">
        {/* Rest of your components */}
        <ExpenseForm
          addExpense={addExpense}
          expenseToUpdate={expenseToUpdate}
          updateExpense={updateExpense}
          resetExpenseToUpdate={resetExpenseToUpdate}
        />
        <div className="expenseContainer">
          <ExpenseInfo expenses={state.expenses} />
          <ExpenseList
            expenses={state.expenses}
            deleteExpense={deleteExpense}
            changeExpenseToUpdate={setExpenseToUpdate}
          />
        </div>
      </div>
    </>
  );
}

export default App;
