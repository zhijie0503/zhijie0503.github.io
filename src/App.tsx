import { useState } from 'react'
import styled from 'styled-components'
import Grid from './components/Grid'
import './App.css'

// 等级评价系统
const getLevelTitle = (score: number) => {
  if (score < 60) return '继续努力'
  if (score < 70) return 'L5'
  if (score < 80) return 'L6'
  if (score < 90) return 'L7'
  if (score < 100) return 'L8'
  if (score < 110) return 'L9'
  if (score < 120) return 'L10'
  if (score < 130) return 'L11'
  if (score < 140) return 'L12'
  if (score < 150) return 'L13'
  return '兴哥'
}

function App() {
  const [score, setScore] = useState(0)
  const [gameKey, setGameKey] = useState(0)
  const [gameEnded, setGameEnded] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [level, setLevel] = useState('')

  const handleScoreChange = (points: number) => {
    setScore(prevScore => prevScore + points)
  }

  const handleGameEnd = (_: number) => {
    // 使用当前分数作为最终得分
    const currentScore = score
    setFinalScore(currentScore)
    setLevel(getLevelTitle(currentScore))
    setGameEnded(true)
  }

  const handleReset = () => {
    setScore(0)
    setGameKey(prevKey => prevKey + 1)
    setGameEnded(false)
    setFinalScore(0)
    setLevel('')
  }

  return (
    <Container>
      <Title>方格消除游戏</Title>
      <Description>
        选择数字，使它们的和等于10来消除方格。每消除一个方格得1分，60秒时间限制。
      </Description>
      <ScoreBoard>
        得分: <ScoreValue>{score}</ScoreValue>
      </ScoreBoard>
      
      {gameEnded ? (
        <ResultContainer>
          <ResultTitle>游戏结束!</ResultTitle>
          <ResultScore>最终得分: <span>{finalScore}</span></ResultScore>
          <LevelDisplay>等级: <span>{level}</span></LevelDisplay>
          <ResultMessage>
            {finalScore < 60 
              ? '再接再厉！' 
              : finalScore >= 150 
                ? '恭喜您成为兴哥！' 
                : '恭喜达到新等级！'}
          </ResultMessage>
          <ResetButton onClick={handleReset}>再玩一次</ResetButton>
        </ResultContainer>
      ) : (
        <Grid 
          key={gameKey} 
          onScoreChange={handleScoreChange} 
          onGameEnd={handleGameEnd}
        />
      )}
      
      {!gameEnded && (
        <ResetButton onClick={handleReset}>重新开始</ResetButton>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  min-width: 800px;
`

const Title = styled.h1`
  color: #222;
  margin-bottom: 1rem;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`

const Description = styled.p`
  color: #555;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
`

const ScoreBoard = styled.div`
  background-color: #4a6fa5;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`

const ScoreValue = styled.span`
  font-weight: bold;
  font-size: 1.4rem;
`

const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 400px;
`

const ResultTitle = styled.h2`
  color: #e74c3c;
  font-size: 2rem;
  margin-bottom: 1.5rem;
`

const ResultScore = styled.div`
  font-size: 1.4rem;
  margin-bottom: 1rem;
  
  span {
    font-weight: bold;
    color: #3498db;
    font-size: 1.6rem;
  }
`

const LevelDisplay = styled.div`
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  
  span {
    font-weight: bold;
    color: #2ecc71;
    font-size: 1.6rem;
  }
`

const ResultMessage = styled.p`
  color: #7f8c8d;
  font-size: 1.2rem;
  margin-bottom: 2rem;
`

const ResetButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  margin-top: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #c0392b;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`

export default App 