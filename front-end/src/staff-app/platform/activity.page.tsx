import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { useApi } from "shared/hooks/use-api"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { RollStateList } from "staff-app/components/roll-state/roll-state-list.component"
import { filterStudents, getRollSummary, ItemType, markAttendance, toTitleCase } from "staff-app/providers/service"
import { Person } from "shared/models/person"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { faChevronRight, faWindowClose } from "@fortawesome/free-solid-svg-icons"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type Props = {
  data: any
  onClose: any
}
export const ActivityPage: React.FC = () => {
  const [getActivities, data, loadState] = useApi<{ activity: any[] }>({ url: "get-activities" })
  const [IsOpen, setIsOpen] = useState(false)
  const [Data, setData] = useState(false)

  useEffect(() => {
    void getActivities()
  }, [getActivities])

  // function for formatting the date and time
  const figureDateTime = (date: string) => {
    const f = (x: number) => (x < 10 ? "0" + x : "" + x)
    const dt = new Date(date)
    let formatdate = f(dt.getDate())
    let month = f(dt.getMonth() + 1)
    let year = dt.getFullYear()
    let h = f(dt.getHours())
    let m = f(dt.getMinutes())
    let s = f(dt.getSeconds())
    return `${formatdate}-${month}-${year}/${h}:${m}:${s}`
  }

  //function to set data on click of action button
  const handleActionButton = (e: React.MouseEvent, data: any) => {
    data.rollData.sort((a: any, b: any) => a.student_id - b.student_id)
    setData(data)
    setIsOpen(true)
  }

  return (
    <>
      <S.StyledActivityContainer>
        <S.ToolbarContainer>
          <span>Name</span>
          <span>Date & Time</span>
          <span>Type</span>
          <span>Action</span>
        </S.ToolbarContainer>

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" &&
          data &&
          data.activity.map((a) => (
            <S.StyledDiv key={a.type + a.date}>
              <S.ActivitySection >
                <S.ActivityDetailHeader>
                  <S.HeadingText>{a.entity.name}</S.HeadingText>
                  <div>{figureDateTime(a.date)}</div>
                  <div style={{ width: "88px" }}>{a.type[0].toUpperCase() + a.type.slice(1)}</div>
                  <FontAwesomeIcon style={{ cursor: "pointer" }} icon={faChevronRight} onClick={(e) => handleActionButton(e, { rollData: a.entity.student_roll_states, header: "attendance" })} />

                </S.ActivityDetailHeader>
              </S.ActivitySection>
            </S.StyledDiv>
          ))}
        {IsOpen ? <Modal data={Data} onClose={(e: any) => setIsOpen(false)} /> : null}
      </S.StyledActivityContainer>
    </>
  )
}

//modal components
const Modal: React.FC<Props> = ({ data, onClose }) => {
  const [getStudents, list, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [filter, setFilter] = useState<ItemType>("all")
  const [processedData, setProcessedData] = useState<any>();

  const filteredData = { ...processedData, rollData: processedData ? filterStudents(processedData.rollData, { name: "", rollState: filter }) : undefined }
  const stateList = processedData ? getRollSummary(processedData.rollData) : []

  useEffect(() => {
    if (data.header === "attendance") {
      getStudents();
    }
  }, [getStudents])

  useEffect(() => {
    processData(data);
  }, [list])

  //function to proceesing of data for all student
  const processData = (data: any) => {
    switch (data.header) {
      case "attendance":
        if (loadState === "loaded" && list) {
          const markedData = markAttendance(list.students, data.rollData)
          setProcessedData({ ...data, rollData: markedData })
        }
    }
  }


  return (
    <>
      <S.Modal>
        <S.ModalContainer>

          <S.ModalHeader>
            <S.ModalTitle>{toTitleCase(data.header)}</S.ModalTitle>
            {processedData && processedData.header === "attendance" && loadState === "loaded" ? <RollStateList stateList={stateList} /> : null}
            <S.ModalCloseButton onClick={onClose}>
              <FontAwesomeIcon icon={faWindowClose} />
            </S.ModalCloseButton>
          </S.ModalHeader>
          {filteredData && filteredData.header === "attendance" && loadState === "loaded" ? (
            <>
              <div style={{ width: "90%", overflowY: "auto", padding: "10px" }}>
                {filteredData && filteredData.rollData.map((s: any) => <StudentListTile key={s.id} student={s} readOnly />)}
              </div>
            </>
          ) : (
            <div style={{ marginTop: "3rem" }}>
              <FontAwesomeIcon icon="spinner" size="2x" spin />
            </div>
          )}
        </S.ModalContainer>
      </S.Modal>
    </>
  )
}

const S = {
  ActivitySection: styled.div`
  max-width: 1000px;
  width: 90%;
  margin: 0 auto;
  border: 1px solid #e7e7e7;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0 16px;
  `,
  StyledDiv: styled.div`
  margin:20px 0px 0px 0px
  `,
  HeadingText: styled.p`
  font-size: 20px;
  font-weight: 600;
  `,
  ActivityDetailHeader: styled.div`
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`,
  StyledActivityContainer: styled.div`
    display: flex;
    flex-direction: column;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content:space-between;
    align-items: center;
    color: #fff;
    height:40px;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
    max-width: 1000px;
  width: 90%;
  margin: 0 auto;
  `,

  Modal: styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  ModalContainer: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
   width:60%;
    height: 80%;
    overflow-y: auto;
    border-radius: 10px;
    background-color: #fff;
  `,
  ModalHeader: styled.div`
    display: flex;
    justify-content: space-between;
    align-items:center;
    height: 80px;
    width: 100%;
    margin-bottom: 5px;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
    box-shadow: 0 2px 7px rgba(5, 66, 145, 0.5);
    background-color: rgb(52, 63, 100);
    color:#fff;
  `,
  ModalCloseButton: styled(Button)`
      width: 1.5rem;
      height: 1.5rem;
      margin-right: 16px!important;
      padding: ${Spacing.u2};
      font-size: 1.5rem;
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.rounded};
      color: #ffffff; 
  `,
  ModalTitle: styled.div`
    font-size: 1.3rem;
    font-weight: bold;
    padding: 0 1rem;
  `,

}
