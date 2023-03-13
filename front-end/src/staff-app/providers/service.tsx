import { Person } from "shared/models/person"
import { RolllStateType } from "shared/models/roll"

export type sortNameType = {
  ascending: boolean
  byFirstName: boolean
}

export type FilterOptionsType = {
  name: string
  rollState: string
}

export interface StateList {
  type: ItemType
  count: number
}

export type ItemType = RolllStateType | "all"

// function to sort the student by name
const sortStudents = (list: Person[], sortName: sortNameType) => {
  const { ascending, byFirstName } = sortName
  const studentCompare = (a: any, b: any) => {
    const _a = byFirstName ? a.first_name : a.last_name
    const _b = byFirstName ? b.first_name : b.last_name
    const res = _a.localeCompare(_b)
    return ascending ? res : -res
  }
  list.sort(studentCompare)
  return [...list]
}

// function to filter the student based on input
export const filterStudents = (list: Person[], filterOptions: FilterOptionsType) => {
  const { name, rollState } = filterOptions
  return list.filter(
    (e) => `${e.first_name} ${e.last_name}`.toLowerCase().includes(name.toLowerCase()) && (!rollState || rollState.toString() === "all" || e.rollState === rollState)
  )
}
// function to get all student list
export const getListToDisplay = (list: Person[], sortName: sortNameType, filterOptions: FilterOptionsType) => {
  return sortStudents(filterStudents(list, filterOptions), sortName)
}

//function to get rollsummary of all student
export const getRollSummary = (list: Person[]) => {
  const summary = [
    { type: "all", count: list.length },
    { type: "present", count: 0 },
    { type: "late", count: 0 },
    { type: "absent", count: 0 },
  ]

  for (const s of list) {
    switch (s.rollState) {
      case "present":
        summary[1].count++
        break
      case "late":
        summary[2].count++
        break
      case "absent":
        summary[3].count++
        break
    }
  }
  return summary as StateList[]
}

export const markAttendance = (list: Person[], roll: any[]) => {
  // return list
  const roll_map = new Map()
  for (const s of roll) roll_map.set(s.student_id, s.roll_state)
  return list.map((s) => ({ ...s, rollState: roll_map.get(s.id) }))
}

export const toTitleCase = (s: string) => s[0].toUpperCase() + s.slice(1)
