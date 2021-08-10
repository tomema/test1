import React from "react"
import { ContractContext } from "../../../../contexts/ContractContext"
import { NotificationsContext } from "../../../../contexts/NotificationsContext"
import web3 from "../../../../utils/web3"

interface ResultProps {
  round: Round
  bet: Bet | undefined
  winner: string | undefined
  claimCallback: () => void
}

const Result: React.FunctionComponent<ResultProps> = (props) => {
  const {round, bet, winner, claimCallback} = props
  const [claiming, setClaiming] = React.useState(false)

  const {setMessage} = React.useContext(NotificationsContext)
  const {claim} = React.useContext(ContractContext)
  
  const handleClaim = () => {
    setClaiming(true)
    if (bet && bet.epoch) {
      claim(
        bet.epoch,
        () => setMessage({type: "info", title: "Claim confirmed", message: "", duration: 5000}),
        () => {
          claimCallback()
          setMessage({type: "success", title: "Claim processed", message: "", duration: 5000})
          setClaiming(false)
        },
        (e?: Error) => {
          setMessage({type: "error", title: "Claim failed", message: e?.message, duration: 7000})
          setClaiming(false)
        },
      )
    }
  }

  let winAmount = ""
  if (bet && bet?.direction === winner) {
    const payout = winner === "bull" ? round.bullPayout : round.bearPayout
    winAmount = (bet.valueEthNum * payout).toFixed(4)
  }

  const betValue = bet ? Number(web3.utils.fromWei(bet.value, "ether")).toFixed(4) : ""

  let className = "px-5 p-1 border border-grey-800 text-center"
  if (bet && bet?.direction === winner) {
    className = "px-5 p-1 border border-grey-800 text-center bg-accent"
  } else if (bet) {
    className = "px-5 p-1 border border-grey-800 text-center bg-secondary"
  }
  return(
    <td className={className}>
      {bet && bet.direction !== winner && <span>{betValue}</span>}
      {bet && bet.direction === winner && bet.status === "claimable" && !claiming &&
        <button className="btn btn-sm btn-accent text-accent-content font-bold" onClick={handleClaim}>→ {winAmount} ←</button>}
      {bet && bet.direction === winner && (bet.status === "pending" || claiming) && "Claiming..."}
      {bet && bet.direction === winner && bet.status !== "claimable" && <div>
          <span >{winAmount}</span>
          <span>&nbsp;({betValue})</span>
        </div>}
    </td>

  )
}

export default Result
