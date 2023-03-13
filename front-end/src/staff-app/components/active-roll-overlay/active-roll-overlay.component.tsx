import React, { useContext } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/Button"
import { BorderRadius, Spacing } from "shared/styles/styles"
import { RollStateList } from "staff-app/components/roll-state/roll-state-list.component"
import { useApi } from "shared/hooks/use-api"
import { RollContext } from "staff-app/providers/Reducer"
import { RolllStateType } from "shared/models/roll"
import { StateList, getRollSummary } from "staff-app/providers/service"

export type ActiveRollAction = "filter" | "exit"
interface Props {
  isActive?: boolean
  onItemClick?: (action: ActiveRollAction, value?: string) => void
}

export const ActiveRollOverlay: React.FC<Props> = () => {
  const [saveRoll, rollData, loadState] = useApi({ url: "save-roll" })

  const { state, dispatch } = useContext(RollContext)

  const closeOverlay = () => dispatch({ type: "roll", payload: false })

  const handleComplete = () => {
    const student_roll_states: { student_id: number; roll_state: RolllStateType }[] = []
    for (const s of state.studentList) {
      student_roll_states.push({ student_id: s.id, roll_state: s.rollState ? s.rollState : "unmark" })
    }

    saveRoll({ student_roll_states })
    closeOverlay()
  }

  const summary = getRollSummary(state.studentList) as StateList[]
  return (
    <S.Overlay isActive={state.isRollMode}>
      <S.Content>
        <div>Class Attendance</div>
        <div>
          <RollStateList stateList={summary} onItemClick={(type) => dispatch({ type: "search", payload: { rollState: type } })} />
          <div style={{ marginTop: Spacing.u6 }}>
            <Button color="inherit" onClick={closeOverlay}>
              Exit
            </Button>
            <Button color="inherit" style={{ marginLeft: Spacing.u2 }} onClick={handleComplete}>
              Complete
            </Button>
          </div>
        </div>
      </S.Content>
    </S.Overlay>
  )
}

const S = {
  Overlay: styled.div<{ isActive: boolean }>`
    position: fixed;
    bottom: 0;
    left: 0;
    height: ${({ isActive }) => (isActive ? "120px" : 0)};
    width: 100%;
    background-color: rgba(34, 43, 74, 0.92);
    backdrop-filter: blur(2px);
    color: #fff;
  `,
  Content: styled.div`
    display: flex;
    justify-content: space-between;
    width: 52%;
    height: 100px;
    margin: ${Spacing.u3} auto 0;
    border: 1px solid #f5f5f536;
    border-radius: ${BorderRadius.default};
    padding: ${Spacing.u4};
  `,
}
