import React, { useEffect, useContext, useState } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { RollContext } from "staff-app/providers/Reducer"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"

import { getListToDisplay } from "../providers/service"

export const HomeBoardPage: React.FC = () => {
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const { state, dispatch } = useContext(RollContext);
  const [displayList, setDisplayList] = useState<Person[]>([])

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (data && data.students) dispatch({ type: "update", payload: data.students })
  }, [data])

  useEffect(() => {
    setDisplayList(getListToDisplay(state.studentList, state.sortName, state.filterOptions))
  }, [state.studentList, state.sortName, state.filterOptions])

  return (
    <>
      <S.PageContainer>
        <Toolbar />
        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && displayList && (
          <>
            {displayList.map((s: Person) => (
              <StudentListTile key={s.id} student={s} />
            ))}
          </>
        )}

        {loadState === "loaded" && displayList.length === 0 && (
          <CenteredContainer>
            <div>Sorry, no result is found</div>
          </CenteredContainer>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={state.isRollMode} />
    </>
  )
}

const Toolbar: React.FC = () => {
  const { state, dispatch } = useContext(RollContext)
  return (
    <S.ToolbarContainer>
      <div>
        <S.StyledSpan
          onClick={() => dispatch({ type: "sort", payload: { byFirstName: !state.sortName.byFirstName } })}
          title={state.sortName.byFirstName ? "Sort by FirstName" : "Sort by LastName"}>
          {state.sortName.byFirstName ? "First Name" : "Last Name"}
        </S.StyledSpan>
        <S.StyedSpanArrow
          onClick={() => dispatch({ type: "sort", payload: { ascending: !state.sortName.ascending } })}>
          <FontAwesomeIcon
            icon={state.sortName.ascending ? faArrowUp : faArrowDown}
            title={state.sortName.ascending ? "ascending" : "descending"} />
        </S.StyedSpanArrow>
      </div>
      <S.StyledDiv>
        <S.StyledInput
          placeholder="Search by name"
          value={state.filterOptions.name}
          onChange={(e) => dispatch({ type: "search", payload: { name: e.target.value } })} />
      </S.StyledDiv>
      <S.Button onClick={() => dispatch({ type: "roll", payload: true })}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,

  StyledSpan: styled.span`
  cursor:pointer;
  `,
  StyedSpanArrow: styled.span`
  cursor:pointer;
   margin-left:10px;
  `,
  StyledDiv: styled.div`
  width: 310px;
  display: flex;
  justify-content: center;
  margin: 0 4px;
  `,
  StyledInput: styled.input`
  width:100%;
  height:20px;
    padding: 5px;
    border-radius: 5px;
    border: 2px solid transparent;
  `,
}
