import React, { useReducer, createContext, Dispatch } from "react"
import { Person } from "shared/models/person"
import { sortNameType, FilterOptionsType } from "./service"

//create initial state
const initialState: StateType = {
  studentList: [],
  isRollMode: false,
  sortName: {
    ascending: true,
    byFirstName: true,
  },
  filterOptions: {
    name: "",
    rollState: "",
  },
}

//typescript define
type StateType = {
  studentList: Person[]
  isRollMode: boolean
  sortName: sortNameType
  filterOptions: FilterOptionsType
}

//typescript define
type ContextType = {
  state: StateType
  dispatch: Dispatch<{ type: string; payload: any }>
}

// create context
export const RollContext = createContext<ContextType>({ state: initialState, dispatch: () => { } })

//create reducer function
const reducer = (state: any, action: { type: string; payload: any }) => {
  const { type, payload } = action

  switch (type) {
    case "sort":
      return {
        ...state,
        sortName: { ...state.sortName, ...payload },
      }

    case "search":
      return {
        ...state,
        filterOptions: { ...state.filterOptions, ...payload },
      }

    case "roll":
      return {
        ...state,
        isRollMode: payload,
      }

    case "update":
      return {
        ...state,
        studentList: payload as Person[],
      }


    case "mark":
      const newList = state.studentList.map((s: Person) => (s.id === payload.id ? { ...s, rollState: payload.rollState } : s))
      return {
        ...state,
        studentList: newList,
      }
    default:
      return { ...state }
  }
}

type Props = {}
export const Reducer: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <RollContext.Provider value={{ state, dispatch }}>{children}</RollContext.Provider>
}

export default Reducer
