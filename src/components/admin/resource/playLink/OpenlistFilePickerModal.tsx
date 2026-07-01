'use client'

import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react'
import { ExternalLink } from 'lucide-react'

import { removeHttpPrefix, safeDecodeURI } from '@/utils/link'

import type { ResourcePlayLink } from '@/types/api/resource-play-link'

export type PickerMode = 'single' | 'batch'

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: PickerMode
  fileLoading: boolean
  fileList: string[]
  playLinks: ResourcePlayLink[]
  // single mode
  onSelectSingle: (link: string) => void
  // batch mode
  batchSelected: string[]
  onToggleBatchSelect: (link: string) => void
  batchSubmitting: boolean
  onBatchConfirm: () => void
}

export const OpenlistFilePickerModal = ({
  isOpen,
  onClose,
  mode,
  fileLoading,
  fileList,
  playLinks,
  onSelectSingle,
  batchSelected,
  onToggleBatchSelect,
  batchSubmitting,
  onBatchConfirm
}: Props) => {
  const isBatch = mode === 'batch'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      isDismissable={!batchSubmitting}
    >
      <ModalContent>
        <ModalHeader>
          {isBatch
            ? '批量选择 openlist 文件（按点击顺序作为集数序号）'
            : '选择 openlist 文件'}
        </ModalHeader>
        <ModalBody>
          {fileLoading ? (
            <div className="text-center py-8 text-default-500">
              正在获取文件列表...
            </div>
          ) : !fileList.length ? (
            <div className="text-center py-8 text-default-500">
              暂无可选文件
            </div>
          ) : (
            <Table aria-label="openlist 文件列表">
              <TableHeader>
                <TableColumn width={80}>
                  {isBatch ? '选择顺序' : '序号'}
                </TableColumn>
                <TableColumn>文件链接</TableColumn>
                <TableColumn width={140}>操作</TableColumn>
              </TableHeader>
              <TableBody>
                {fileList.map((link, index) => {
                  const selectedIndex = batchSelected.indexOf(link)
                  const isSelected = selectedIndex !== -1
                  const normalized = removeHttpPrefix(link)
                  const isAlreadyAdded = playLinks.some(
                    (p) => p.link === normalized
                  )

                  return (
                    <TableRow
                      key={link}
                      className={isAlreadyAdded ? 'opacity-50' : ''}
                    >
                      <TableCell>
                        {isBatch ? (
                          isAlreadyAdded ? (
                            <Chip color="default" variant="flat">
                              已添加
                            </Chip>
                          ) : isSelected ? (
                            <Chip color="success" variant="flat">
                              {selectedIndex + 1}
                            </Chip>
                          ) : (
                            <Chip color="default" variant="flat">
                              -
                            </Chip>
                          )
                        ) : (
                          <Chip color="primary" variant="flat">
                            {index + 1}
                          </Chip>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="break-all">{safeDecodeURI(link)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => window.open(link, '_blank')}
                          >
                            <ExternalLink size={14} />
                          </Button>
                          {isBatch ? (
                            <Button
                              size="sm"
                              color={isSelected ? 'danger' : 'primary'}
                              variant="flat"
                              onPress={() => onToggleBatchSelect(link)}
                              isDisabled={batchSubmitting || isAlreadyAdded}
                            >
                              {isAlreadyAdded
                                ? '已添加'
                                : isSelected
                                  ? '取消'
                                  : '选择'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => onSelectSingle(link)}
                            >
                              选择
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={batchSubmitting}
          >
            {isBatch ? '取消' : '关闭'}
          </Button>
          {isBatch && (
            <Button
              color="primary"
              onPress={onBatchConfirm}
              isLoading={batchSubmitting}
              isDisabled={!batchSelected.length}
            >
              确认添加 ({batchSelected.length})
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
