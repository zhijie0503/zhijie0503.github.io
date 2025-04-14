import styled from 'styled-components'

interface CellProps {
  value: number
  isSelected: boolean
  isZero: boolean
  onMouseDown: () => void
  onMouseEnter: () => void
}

const Cell = ({ value, isSelected, isZero, onMouseDown, onMouseEnter }: CellProps) => {
  return (
    <CellContainer 
      isSelected={isSelected}
      isZero={isZero}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      value={value}
    >
      {value > 0 ? value : ''}
    </CellContainer>
  )
}

interface StyledCellProps {
  isSelected: boolean
  isZero: boolean
  value: number
}

// 根据数值不同设置不同的颜色
const getColorByValue = (value: number) => {
  if (value === 0) return 'transparent'
  
  const colors = [
    '#3498db', // 1 - 蓝色
    '#2ecc71', // 2 - 绿色
    '#e74c3c', // 3 - 红色
    '#9b59b6', // 4 - 紫色
    '#f1c40f', // 5 - 黄色
    '#1abc9c', // 6 - 青绿色
    '#d35400', // 7 - 橙色
    '#34495e', // 8 - 深蓝色
    '#e84393'  // 9 - 粉色
  ]
  
  return colors[value - 1] || '#3498db'
}

// 单元格样式
const CellContainer = styled.div<StyledCellProps>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isZero ? 'default' : 'pointer'};
  font-weight: bold;
  margin: 2px;
  border-radius: 4px;
  color: #fff;
  background-color: ${props => {
    if (props.isSelected) return '#f39c12'
    return getColorByValue(props.value)
  }};
  opacity: ${props => props.isZero ? 0.3 : 1};
  transition: all 0.2s ease;
  box-shadow: ${props => props.isSelected 
    ? '0 0 8px rgba(243, 156, 18, 0.8)' 
    : props.isZero ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'};
  transform: ${props => props.isSelected ? 'scale(1.1)' : 'scale(1)'};
  z-index: ${props => props.isSelected ? 2 : 1};
  
  &:hover {
    filter: ${props => props.isZero ? 'none' : 'brightness(1.2)'};
  }
  
  &:active {
    transform: ${props => props.isZero ? 'scale(1)' : 'scale(0.95)'};
  }
`

export default Cell 