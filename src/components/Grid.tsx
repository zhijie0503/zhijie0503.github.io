import { useState, useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import Cell from './Cell'

// 定义网格大小
const GRID_SIZE = 20
const TARGET_SUM = 10
const GAME_DURATION = 60 // 游戏时长（秒）

// 生成1-9的随机数
const generateRandomNumber = () => Math.floor(Math.random() * 9) + 1

// 生成初始网格
const generateGrid = () => {
  const grid = []
  for (let i = 0; i < GRID_SIZE; i++) {
    const row = []
    for (let j = 0; j < GRID_SIZE; j++) {
      row.push({
        value: generateRandomNumber(),
        id: `${i}-${j}`,
        isZero: false
      })
    }
    grid.push(row)
  }
  return grid
}

interface Position {
  row: number
  col: number
}

interface GridProps {
  onScoreChange: (points: number) => void
  onGameEnd: (score: number) => void
}

const Grid = ({ onScoreChange, onGameEnd }: GridProps) => {
  const [grid, setGrid] = useState(generateGrid())
  const [selectedCells, setSelectedCells] = useState<Position[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionSum, setSelectionSum] = useState(0)
  const [lastHoverCell, setLastHoverCell] = useState<Position | null>(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameActive, setGameActive] = useState(true)
  const gridRef = useRef<HTMLDivElement>(null)
  
  // 获取触摸或鼠标事件中的坐标对应的网格单元格
  const getCellFromEvent = (clientX: number, clientY: number) => {
    if (!gridRef.current) return null
    
    const gridRect = gridRef.current.getBoundingClientRect()
    const x = clientX - gridRect.left
    const y = clientY - gridRect.top
    
    // 单元格大小（宽度+边距）
    const cellSize = 36 // 32px宽度 + 2px边距*2
    
    // 计算行列
    const row = Math.floor(y / cellSize)
    const col = Math.floor(x / cellSize)
    
    // 确保在有效范围内
    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return { row, col }
    }
    
    return null
  }

  // 游戏计时器
  useEffect(() => {
    if (!gameActive) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameActive(false)
          onGameEnd(0) // 会在App组件中获取实际分数
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive, onGameEnd])

  // 计算选中单元格的数字之和
  useEffect(() => {
    const sum = selectedCells.reduce((acc, { row, col }) => {
      return acc + grid[row][col].value
    }, 0)
    
    setSelectionSum(sum)
    
    // 当和为10时清除选中单元格
    if (sum === TARGET_SUM && selectedCells.length > 0) {
      // 创建新的网格数据
      const newGrid = [...grid]
      
      // 将选中的单元格值设为0并标记为透明
      selectedCells.forEach(({ row, col }) => {
        newGrid[row][col] = {
          ...newGrid[row][col],
          value: 0,
          isZero: true
        }
      })
      
      // 更新得分（每个方格1分）
      onScoreChange(selectedCells.length)
      
      // 更新状态
      setGrid(newGrid)
      setSelectedCells([])
      setSelectionSum(0)
    }
  }, [selectedCells, grid, onScoreChange])

  // 开始选择
  const handleMouseDown = (row: number, col: number) => {
    if (!gameActive) return
    
    // 不能选择值为0的方格
    if (grid[row][col].value === 0) return
    
    const newSelectedCells: Position[] = [{ row, col }]
    setSelectedCells(newSelectedCells)
    setIsSelecting(true)
    setLastHoverCell({ row, col })
  }

  // 拖动选择
  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting || !gameActive) return
    
    // 如果是值为0的方格，不允许选择
    if (grid[row][col].value === 0) return
    
    // 如果刚刚处理过这个单元格，直接返回
    if (lastHoverCell && lastHoverCell.row === row && lastHoverCell.col === col) {
      return
    }
    
    // 更新最后处理的单元格
    setLastHoverCell({ row, col })
    
    // 检查当前单元格是否已被选中
    const isCellSelected = selectedCells.some(
      cell => cell.row === row && cell.col === col
    )
    
    if (!isCellSelected) {
      // 如果之前选中的单元格为空，直接添加
      if (selectedCells.length === 0) {
        setSelectedCells([{ row, col }])
        return
      }
      
      // 检查当前单元格是否与最后一个选中的单元格相邻
      const lastCell = selectedCells[selectedCells.length - 1]
      const isAdjacent = 
        (Math.abs(row - lastCell.row) === 1 && col === lastCell.col) ||
        (Math.abs(col - lastCell.col) === 1 && row === lastCell.row)
      
      if (isAdjacent) {
        setSelectedCells([...selectedCells, { row, col }])
      }
    }
  }

  // 完成选择
  const handleMouseUp = useCallback(() => {
    setIsSelecting(false)
    
    // 如果和不为10，清空选择
    if (selectionSum !== TARGET_SUM) {
      setSelectedCells([])
    }
  }, [selectionSum])

  // 鼠标离开网格时处理
  const handleMouseLeave = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false)
      
      // 如果和不为10，清空选择
      if (selectionSum !== TARGET_SUM) {
        setSelectedCells([])
      }
    }
  }, [isSelecting, selectionSum])

  // 处理触摸开始事件
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!gameActive) return
    
    // 防止默认行为（如滚动）
    e.preventDefault()
    
    const touch = e.touches[0]
    const cellPos = getCellFromEvent(touch.clientX, touch.clientY)
    
    if (cellPos) {
      const { row, col } = cellPos
      
      // 不能选择值为0的方格
      if (grid[row][col].value === 0) return
      
      const newSelectedCells: Position[] = [{ row, col }]
      setSelectedCells(newSelectedCells)
      setIsSelecting(true)
      setLastHoverCell({ row, col })
    }
  }
  
  // 处理触摸移动事件
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting || !gameActive) return
    
    // 防止默认行为（如滚动）
    e.preventDefault()
    
    const touch = e.touches[0]
    const cellPos = getCellFromEvent(touch.clientX, touch.clientY)
    
    if (cellPos) {
      const { row, col } = cellPos
      
      // 如果是值为0的方格，不允许选择
      if (grid[row][col].value === 0) return
      
      // 如果刚刚处理过这个单元格，直接返回
      if (lastHoverCell && lastHoverCell.row === row && lastHoverCell.col === col) {
        return
      }
      
      // 更新最后处理的单元格
      setLastHoverCell({ row, col })
      
      // 检查当前单元格是否已被选中
      const isCellSelected = selectedCells.some(
        cell => cell.row === row && cell.col === col
      )
      
      if (!isCellSelected) {
        // 如果之前选中的单元格为空，直接添加
        if (selectedCells.length === 0) {
          setSelectedCells([{ row, col }])
          return
        }
        
        // 检查当前单元格是否与最后一个选中的单元格相邻
        const lastCell = selectedCells[selectedCells.length - 1]
        const isAdjacent = 
          (Math.abs(row - lastCell.row) === 1 && col === lastCell.col) ||
          (Math.abs(col - lastCell.col) === 1 && row === lastCell.row)
        
        if (isAdjacent) {
          setSelectedCells([...selectedCells, { row, col }])
        }
      }
    }
  }
  
  // 处理触摸结束事件
  const handleTouchEnd = () => {
    setIsSelecting(false)
    
    // 如果和不为10，清空选择
    if (selectionSum !== TARGET_SUM) {
      setSelectedCells([])
    }
  }

  // 添加全局鼠标抬起事件监听器
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseUp])

  return (
    <Container onMouseLeave={handleMouseLeave}>
      <GameInfo>
        <SelectionInfo sum={selectionSum} target={TARGET_SUM} />
        <TimeDisplay active={gameActive}>剩余时间: {timeLeft}秒</TimeDisplay>
      </GameInfo>
      <GridContainer 
        ref={gridRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {grid.map((row, rowIndex) => (
          <Row key={rowIndex}>
            {row.map((cell, colIndex) => {
              const isSelected = selectedCells.some(
                selectedCell => 
                  selectedCell.row === rowIndex && 
                  selectedCell.col === colIndex
              )
              
              return (
                <Cell
                  key={cell.id}
                  value={cell.value}
                  isZero={cell.isZero}
                  isSelected={isSelected}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                />
              )
            })}
          </Row>
        ))}
      </GridContainer>
    </Container>
  )
}

// 显示选择情况的组件
const SelectionInfo = ({ sum, target }: { sum: number, target: number }) => {
  const isMatch = sum === target && sum > 0
  const isOver = sum > target
  
  let message = ''
  let messageStyle = {}
  
  if (isMatch) {
    message = '完美匹配！'
    messageStyle = { color: '#2ecc71' }
  } else if (isOver) {
    message = '数字和超过了10'
    messageStyle = { color: '#e74c3c' }
  } else if (sum > 0) {
    message = `当前和: ${sum} (目标: ${target})`
    messageStyle = { color: '#3498db' }
  } else {
    message = `选择数字，使它们的和等于 ${target}`
    messageStyle = { color: '#7f8c8d' }
  }
  
  return <InfoText style={messageStyle}>{message}</InfoText>
}

const GameInfo = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
`

const TimeDisplay = styled.div<{ active: boolean }>`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${props => props.active ? '#3498db' : '#e74c3c'};
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const InfoText = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  height: 1.5rem;
`

const GridContainer = styled.div`
  background-color: #34495e;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  user-select: none;
  touch-action: none; /* 防止浏览器的默认触摸行为如滚动 */
  
  @media (max-width: 768px) {
    transform: scale(0.85);
    transform-origin: top center;
  }
  
  @media (max-width: 480px) {
    transform: scale(0.7);
    transform-origin: top center;
  }
`

const Row = styled.div`
  display: flex;
`

export default Grid 