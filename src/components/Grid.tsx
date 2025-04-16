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
  const [isMobileMode, setIsMobileMode] = useState(false)
  const [touchMessage, setTouchMessage] = useState('')
  const gridRef = useRef<HTMLDivElement>(null)
  
  // 检测是否为移动设备
  useEffect(() => {
    const checkIsMobile = () => {
      return window.innerWidth <= 768;
    };
    
    setIsMobileMode(checkIsMobile());
    
    const handleResize = () => {
      setIsMobileMode(checkIsMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 获取触摸或鼠标事件中的坐标对应的网格单元格
  const getCellFromEvent = (clientX: number, clientY: number) => {
    if (!gridRef.current) return null
    
    const gridRect = gridRef.current.getBoundingClientRect()
    const x = clientX - gridRect.left
    const y = clientY - gridRect.top
    
    // 获取实际网格容器的尺寸
    const gridWidth = gridRect.width
    const gridHeight = gridRect.height
    
    // 计算单个单元格的实际尺寸（考虑到 transform: scale 的影响）
    const cellWidth = gridWidth / GRID_SIZE
    const cellHeight = gridHeight / GRID_SIZE
    
    // 计算行列（更精确）
    const row = Math.floor(y / cellHeight)
    const col = Math.floor(x / cellWidth)
    
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
      setTouchMessage('完美匹配！')
      
      // 短暂显示消息后清除
      setTimeout(() => {
        setTouchMessage('');
      }, 1500);
    }
  }, [selectedCells, grid, onScoreChange])

  // 判断两个单元格之间是否有有效路径（不考虑值为0的格子）
  const isValidPath = (grid: any[][], start: Position, end: Position): boolean => {
    // 如果行相同，检查两个单元格之间的列是否有有效路径
    if (start.row === end.row) {
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      
      // 如果它们相邻，直接返回true
      if (maxCol - minCol === 1) return true;
      
      // 检查它们之间是否都是值为0的格子
      for (let col = minCol + 1; col < maxCol; col++) {
        if (grid[start.row][col].value !== 0) {
          return false;
        }
      }
      return true;
    }
    
    // 如果列相同，检查两个单元格之间的行是否有有效路径
    if (start.col === end.col) {
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      
      // 如果它们相邻，直接返回true
      if (maxRow - minRow === 1) return true;
      
      // 检查它们之间是否都是值为0的格子
      for (let row = minRow + 1; row < maxRow; row++) {
        if (grid[row][start.col].value !== 0) {
          return false;
        }
      }
      return true;
    }
    
    // 如果既不是同行也不是同列，则不是有效路径
    return false;
  }

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
      
      // 检查当前单元格是否与最后一个选中的单元格相邻（考虑消除的格子）
      const lastCell = selectedCells[selectedCells.length - 1]
      const isValidConnection = isValidPath(grid, lastCell, { row, col })
      
      if (isValidConnection) {
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
    
    // 防止默认行为（如滚动和缩放）
    e.preventDefault()
    e.stopPropagation()
    
    const touch = e.touches[0]
    const cellPos = getCellFromEvent(touch.clientX, touch.clientY)
    
    if (cellPos) {
      const { row, col } = cellPos
      
      // 不能选择值为0的方格
      if (grid[row][col].value === 0) return
      
      if (isMobileMode) {
        // 移动端模式：检查是否已有一个选中的方格
        if (selectedCells.length === 1) {
          const firstCell = selectedCells[0];
          
          // 检查是否有有效路径
          const isValidConnection = isValidPath(grid, firstCell, { row, col });
          
          if (isValidConnection) {
            // 添加第二个方格
            const newSelectedCells = [...selectedCells, { row, col }];
            setSelectedCells(newSelectedCells);
            
            // sum计算在useEffect中完成，但我们可以在这里预先检查
            const sum = grid[firstCell.row][firstCell.col].value + grid[row][col].value;
            
            if (sum !== TARGET_SUM) {
              // 如果和不为10，清空选择，并将当前点击的方格设为第一个选中方格
              setTouchMessage(`和为${sum}，不是${TARGET_SUM}，请重试`);
              
              // 短暂显示消息后清除
              setTimeout(() => {
                setTouchMessage('');
                setSelectedCells([{ row, col }]);
              }, 1000);
            }
          } else {
            // 如果没有有效路径，将当前点击的方格设为第一个选中方格
            setSelectedCells([{ row, col }]);
          }
        } else {
          // 没有选中的方格，设置第一个
          setSelectedCells([{ row, col }]);
        }
      } else {
        // 桌面模式：原来的拖动选择逻辑
        const newSelectedCells: Position[] = [{ row, col }]
        setSelectedCells(newSelectedCells)
        setIsSelecting(true)
        setLastHoverCell({ row, col })
      }
    }
  }
  
  // 处理触摸移动事件
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isMobileMode) return; // 移动端模式下不处理触摸移动
    
    if (!isSelecting || !gameActive) return
    
    // 防止默认行为（如滚动和缩放）
    e.preventDefault()
    e.stopPropagation()
    
    // 获取最新的触摸位置
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
        
        // 检查当前单元格是否与最后一个选中的单元格有有效路径
        const lastCell = selectedCells[selectedCells.length - 1]
        const isValidConnection = isValidPath(grid, lastCell, { row, col })
        
        if (isValidConnection) {
          setSelectedCells(prev => [...prev, { row, col }])
        }
      }
    }
  }
  
  // 处理触摸结束事件
  const handleTouchEnd = (e: React.TouchEvent) => {
    // 防止默认行为
    e.preventDefault()
    e.stopPropagation()
    
    setIsSelecting(false)
    
    // 如果和不为10，清空选择
    if (selectionSum !== TARGET_SUM) {
      setSelectedCells([])
    }
  }

  // 处理触摸取消事件
  const handleTouchCancel = (e: React.TouchEvent) => {
    // 防止默认行为
    e.preventDefault()
    e.stopPropagation()
    
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
        <SelectionInfo sum={selectionSum} target={TARGET_SUM} isMobile={isMobileMode} message={touchMessage} />
        <TimeDisplay active={gameActive}>剩余时间: {timeLeft}秒</TimeDisplay>
      </GameInfo>
      <GridContainer 
        ref={gridRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
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
      {isMobileMode && selectedCells.length === 1 && (
        <MobileHint>
          已选择 {grid[selectedCells[0].row][selectedCells[0].col].value}，
          请点击另一个方格使和为 {TARGET_SUM}
        </MobileHint>
      )}
    </Container>
  )
}

// 显示选择情况的组件
const SelectionInfo = ({ sum, target, isMobile, message }: { sum: number, target: number, isMobile?: boolean, message?: string }) => {
  const isMatch = sum === target && sum > 0
  const isOver = sum > target
  
  let displayMessage = message || '';
  let messageStyle = {};
  
  if (!displayMessage) {
    if (isMatch) {
      displayMessage = '完美匹配！'
      messageStyle = { color: '#2ecc71' }
    } else if (isOver) {
      displayMessage = '数字和超过了10'
      messageStyle = { color: '#e74c3c' }
    } else if (sum > 0) {
      if (!isMobile) {
        displayMessage = `当前和: ${sum} (目标: ${target})`
        messageStyle = { color: '#3498db' }
      }
    } else {
      if (!isMobile) {
        displayMessage = `选择数字，使它们的和等于 ${target}`
        messageStyle = { color: '#7f8c8d' }
      }
    }
  } else {
    // 使用传入的消息
    if (displayMessage.includes('匹配')) {
      messageStyle = { color: '#2ecc71' }
    } else {
      messageStyle = { color: '#e74c3c' }
    }
  }
  
  return <InfoText style={messageStyle}>{displayMessage}</InfoText>
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
  width: calc(${GRID_SIZE} * 36px); /* 显式设置宽度 */
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 690px; /* 约等于 36px * 20 - 一些边距 */
    transform: scale(0.9);
    transform-origin: top center;
  }
  
  @media (max-width: 480px) {
    transform: scale(0.75);
    transform-origin: top center;
  }
  
  @media (max-width: 380px) {
    transform: scale(0.65);
    transform-origin: top center;
  }
  
  @media (max-width: 320px) {
    transform: scale(0.55);
    transform-origin: top center;
  }
`

const Row = styled.div`
  display: flex;
`

const MobileHint = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
  color: #3498db;
  text-align: center;
  padding: 0.5rem;
  background-color: rgba(52, 152, 219, 0.1);
  border-radius: 8px;
`

export default Grid 