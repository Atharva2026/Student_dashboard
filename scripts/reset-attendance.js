// Reset all student attendance to "not-attempted"
// This script can be run to reset the attendance system

function resetAllAttendance() {
  try {
    const students = JSON.parse(localStorage.getItem("students") || "[]")

    const DYS_SESSIONS = ["DYS1", "DYS2", "DYS3", "DYS4", "DYS5", "DYS6", "DYS7", "DYS8", "DYS9"]

    const updatedStudents = students.map((student) => ({
      ...student,
      attendance: DYS_SESSIONS.reduce((acc, session) => {
        acc[session] = "not-attempted"
        return acc
      }, {}),
      testScores: {}, // Clear test scores as well
    }))

    localStorage.setItem("students", JSON.stringify(updatedStudents))

    // Also clear current user session if exists
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const user = JSON.parse(currentUser)
      const updatedUser = {
        ...user,
        attendance: DYS_SESSIONS.reduce((acc, session) => {
          acc[session] = "not-attempted"
          return acc
        }, {}),
        testScores: {},
      }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }

    return {
      success: true,
      message: `Reset attendance for ${updatedStudents.length} students`,
      studentsUpdated: updatedStudents.length,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to reset attendance",
      error: error.message,
    }
  }
}

// Run the reset function
const result = resetAllAttendance()
console.log("Reset Result:", result)
