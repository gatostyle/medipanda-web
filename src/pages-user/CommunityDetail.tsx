import {
  type BoardDetailsResponse,
  BoardType,
  type CommentResponse,
  createComment,
  createReport,
  deleteBoardPost,
  deleteComment,
  getBoardDetails,
  ReportType,
  toggleLike,
  toggleLike_1,
  updateComment,
} from '@/backend';
import { MedipandaEditorContent } from '@/components/MedipandaTiptapContainer';
import { CommunityTrendingList } from '@/custom/components/CommunityTrendingList';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaDialog, MedipandaDialogContent, MedipandaDialogTitle } from '@/custom/components/MedipandaDialog';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useSession } from '@/hooks/useSession';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD_HH_MM } from '@/lib/utils/dateFormat';
import { MoreHoriz } from '@mui/icons-material';
import { FormControlLabel, IconButton, Popover, Radio, RadioGroup, Stack, type StackProps, Typography } from '@mui/material';
import { type FormEvent, useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function CommunityDetail({ boardType }: { boardType: keyof typeof BoardType }) {
  const { session } = useSession();

  const { id: paramId } = useParams();
  const boardPostId = Number(paramId);

  const navigate = useNavigate();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);

  useEffect(() => {
    if (Number.isNaN(boardPostId)) {
      alert('잘못된 접근입니다.');
      navigate(-1);
      return;
    }

    fetchDetail(boardPostId);
  }, [boardPostId, navigate]);

  const fetchDetail = async (id: number) => {
    const response = await getBoardDetails(id, { filterBlind: true, filterDeleted: true });

    setDetail(response);
  };

  const { editor } = useMedipandaEditor();

  useEffect(() => {
    if (detail === null) {
      return;
    }

    editor.setEditable(false);
    editor.commands.setContent(detail.content);
  }, [detail, editor]);

  const handleCommentUpdate = () => {
    fetchDetail(boardPostId);
  };

  const handleLike = async () => {
    await toggleLike_1(boardPostId);
    await fetchDetail(boardPostId);
  };

  const [postPopupAnchor, setPostPopupAnchor] = useState<HTMLElement | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const handleDelete = async () => {
    const confirmed = confirm('정말 삭제하시겠습니까?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteBoardPost(boardPostId);
      alert('게시글이 삭제되었습니다.');
      navigate(`/community/${boardType.toLowerCase().replace(/_/g, '-')}`, { replace: true });
    } catch (e) {
      console.error('Error deleting post: ', e);
      alert('게시글 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleReport = () => {
    setPostPopupAnchor(null);
    setReportModalOpen(true);
  };

  if (!detail) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <Stack
        direction='row'
        alignItems='flex-start'
        gap='24px'
        sx={{
          marginTop: '40px',
        }}
      >
        <Stack
          sx={{
            flexGrow: 1,
            overflowX: 'hidden',
          }}
        >
          <Stack
            gap='5px'
            sx={{
              padding: '20px',
              borderTop: `1px solid ${colors.gray50}`,
            }}
          >
            <Stack direction='row' alignItems='center'>
              <Typography variant='headingPc4B' sx={{ color: colors.gray80 }}>
                {detail.title}
              </Typography>
              {(detail.userId === session?.userId || detail.userId !== 'super') && (
                <IconButton
                  size='small'
                  onClick={event => setPostPopupAnchor(event.currentTarget)}
                  sx={{
                    marginLeft: 'auto',
                  }}
                >
                  <MoreHoriz />
                </IconButton>
              )}
            </Stack>
            <Typography variant='normalPcB' sx={{ color: colors.gray80 }}>
              {detail.hiddenNickname ? '익명' : detail.nickname}
            </Typography>
            <Typography variant='smallPcR' sx={{ color: colors.gray50 }}>
              {DateUtils.parseUtcAndFormatKst(detail.createdAt, DATEFORMAT_YYYY_MM_DD_HH_MM)}
            </Typography>
          </Stack>
          <Stack
            gap='20px'
            sx={{
              padding: '40px 20px',
              borderTop: `1px solid ${colors.gray30}`,
              borderBottom: `1px solid ${colors.gray30}`,
            }}
          >
            <MedipandaEditorContent editor={editor} />

            <Stack direction='row' alignItems='center' gap='30px'>
              <Stack
                direction='row'
                alignItems='center'
                gap='5px'
                onClick={handleLike}
                sx={{
                  borderBottom: `1px solid transparent`,
                  cursor: 'pointer',
                  color: detail.likedByMe ? colors.vividViolet : colors.gray60,
                  '&:hover': {
                    borderColor: colors.gray60,
                    boxSizing: 'border-box',
                  },
                }}
              >
                <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M2.96745 9.27345L7.60252 13.6276C7.65436 13.6763 7.68028 13.7007 7.70496 13.7187C7.88082 13.8475 8.11983 13.8475 8.29569 13.7187C8.32037 13.7007 8.34629 13.6763 8.39813 13.6276L13.0332 9.27344C14.3373 8.04836 14.4957 6.03237 13.3989 4.61868L13.1926 4.35286C11.8805 2.66169 9.24675 2.94531 8.32477 4.87707C8.19454 5.14994 7.80612 5.14994 7.67588 4.87707C6.75391 2.94531 4.12014 2.66169 2.80802 4.35286L2.60178 4.61868C1.50496 6.03237 1.66333 8.04836 2.96745 9.27345Z'
                    stroke='currentColor'
                    strokeWidth='1.5'
                  />
                </svg>
                <Typography variant='smallTextR' sx={{ marginTop: '2px', lineHeight: '16px' }}>
                  {detail.likesCount.toLocaleString()}
                </Typography>
              </Stack>
              <Stack direction='row' alignItems='center' gap='5px'>
                <img src='/assets/icons/icon-chat.svg' />
                <Typography variant='smallTextR' sx={{ color: colors.gray60, marginTop: '2px', lineHeight: '16px' }}>
                  {detail.commentCount.toLocaleString()}
                </Typography>
              </Stack>
              <Stack direction='row' alignItems='center' gap='5px'>
                <img src='/assets/icons/icon-view-alt.svg' />
                <Typography variant='smallTextR' sx={{ color: colors.gray60, marginTop: '2px', lineHeight: '16px' }}>
                  {detail.viewsCount.toLocaleString()}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <CommentSection
            boardPostId={boardPostId}
            comments={detail.comments}
            onUpdate={handleCommentUpdate}
            sx={{
              marginTop: '20px',
            }}
          />
        </Stack>
        <Stack
          gap='10px'
          sx={{
            width: '400px',
          }}
        >
          <CommunityTrendingList boardType={boardType} />
        </Stack>
      </Stack>

      <Popover
        open={postPopupAnchor !== null}
        anchorEl={postPopupAnchor}
        onClose={() => setPostPopupAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        elevation={0}
      >
        <Stack>
          {detail.userId === session?.userId ? (
            <>
              <MedipandaButton variant='outlined' color='error' onClick={handleDelete}>
                삭제하기
              </MedipandaButton>
              <MedipandaButton
                variant='outlined'
                component={RouterLink}
                to={`/community/${boardType.toLowerCase().replace(/_/g, '-')}/${boardPostId}/edit`}
              >
                수정하기
              </MedipandaButton>
            </>
          ) : (
            <MedipandaButton variant='outlined' color='error' onClick={handleReport}>
              신고하기
            </MedipandaButton>
          )}
        </Stack>
      </Popover>
      <CommunityReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} postId={boardPostId} />
    </>
  );
}

function CommentSection({
  boardPostId,
  comments,
  onUpdate,
  ...props
}: {
  boardPostId: number;
  comments: CommentResponse[];
  onUpdate: () => Promise<void> | void;
} & Omit<StackProps, 'onClick'>): ReturnType<typeof Stack> {
  const { session } = useSession();
  const [replyOpenId, setReplyOpenId] = useState<number | null>(null);

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>, parentId: number | null) => {
    event.preventDefault();

    const form = event.currentTarget;
    const inputElement = form.elements.namedItem('content') as HTMLInputElement;
    const content = inputElement.value;

    try {
      await createComment(session!.userId, {
        boardPostId,
        parentId: parentId,
        content: content,
      });
      await onUpdate();
      inputElement.value = '';
      setReplyOpenId(null);
    } catch (e) {
      console.error('Error creating comment: ', e);
      alert('댓글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const toggleReply = (commentId: number) => {
    setReplyOpenId(prev => (prev === commentId ? null : commentId));
  };

  return (
    <Stack {...props} gap='20px'>
      {/* 글 자체에 대한 댓글 입력창 */}
      <Stack component='form' onSubmit={event => handleCommentSubmit(event, null)}>
        <MedipandaOutlinedInput
          name='content'
          placeholder='댓글을 남겨주세요'
          fullWidth
          endAdornment={
            <MedipandaButton
              type='submit'
              variant='contained'
              size='small'
              color='secondary'
              sx={{
                paddingX: '22px',
                borderRadius: '20px',
              }}
            >
              등록하기
            </MedipandaButton>
          }
          sx={{
            height: '43px',
            border: `1px solid ${colors.gray50}`,
          }}
        />
      </Stack>

      {comments
        .filter(comment => comment.parentId === null)
        .map(comment => {
          const replies = (comment as unknown as { replies: CommentResponse[] }).replies;

          return (
            <Stack key={comment.id} gap='10px'>
              <Comment comment={comment} replies={replies} onUpdate={onUpdate} onReplyClick={() => toggleReply(comment.id)} />
              {replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  replies={null}
                  onUpdate={onUpdate}
                  sx={{
                    padding: '10px 20px',
                    backgroundColor: colors.gray10,
                  }}
                />
              ))}
              {replyOpenId === comment.id && (
                <Stack
                  component='form'
                  onSubmit={event => handleCommentSubmit(event, comment.id)}
                  sx={{
                    padding: '20px',
                    backgroundColor: colors.gray10,
                  }}
                >
                  <MedipandaOutlinedInput
                    name='content'
                    placeholder='대댓글을 남겨주세요'
                    fullWidth
                    endAdornment={
                      <MedipandaButton
                        type='submit'
                        variant='contained'
                        size='small'
                        color='secondary'
                        sx={{
                          paddingX: '22px',
                          borderRadius: '20px',
                        }}
                      >
                        등록하기
                      </MedipandaButton>
                    }
                    sx={{
                      height: '43px',
                      backgroundColor: colors.white,
                      border: `1px solid ${colors.gray50}`,
                    }}
                  />
                </Stack>
              )}
            </Stack>
          );
        })}
    </Stack>
  );
}

function Comment({
  comment,
  replies,
  onUpdate,
  onReplyClick,
  ...props
}: {
  comment: CommentResponse;
  replies: CommentResponse[] | null;
  onUpdate?: () => Promise<void> | void;
  onReplyClick?: () => void;
} & Omit<StackProps, 'onClick'>): ReturnType<typeof Stack> {
  const { session } = useSession();

  const [editMode, setEditMode] = useState(false);

  const form = useForm({
    defaultValues: {
      content: comment.content,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    try {
      const content = values.content.trim();

      if (content === '') {
        alert('댓글 내용을 입력해주세요.');
        return;
      }

      await updateComment({
        id: comment.id,
        content: content,
      });
      setEditMode(false);
      await onUpdate?.();
    } catch (e) {
      console.error('Error updating comment: ', e);
      alert('댓글 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
      return;
    }
  };

  const [postPopupAnchor, setPostPopupAnchor] = useState<HTMLElement | null>(null);

  const handleLike = async () => {
    await toggleLike(comment.id);
    await onUpdate?.();
  };

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const handleEdit = async () => {
    setPostPopupAnchor(null);
    setEditMode(true);
  };

  const handleDelete = async () => {
    setPostPopupAnchor(null);

    const confirmed = confirm('정말 삭제하시겠습니까?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteComment(comment.id);
      alert('댓글이 삭제되었습니다.');
      await onUpdate?.();
    } catch (e) {
      console.error('Error deleting comment: ', e);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleReport = () => {
    setPostPopupAnchor(null);
    setReportModalOpen(true);
  };

  return (
    <>
      <Stack {...props}>
        <Stack direction='row' alignItems='center'>
          <Stack direction='row' alignItems='center' gap='5px'>
            <Typography variant='normalTextB' sx={{ color: colors.gray80 }}>
              {comment.nickname}
            </Typography>
            {comment.userId === session?.userId && <img src='/assets/icons/icon-bullet-my.svg' style={{ width: '25px', height: '14px' }} />}
          </Stack>
          <IconButton
            onClick={event => setPostPopupAnchor(event.currentTarget)}
            size='small'
            sx={{
              marginLeft: 'auto',
            }}
          >
            <MoreHoriz />
          </IconButton>
        </Stack>
        {editMode ? (
          <form onSubmit={form.handleSubmit(submitHandler)} style={{ width: '100%' }}>
            <Controller
              control={form.control}
              name={'content'}
              render={({ field }) => (
                <MedipandaOutlinedInput
                  {...field}
                  placeholder='댓글을 남겨주세요'
                  fullWidth
                  endAdornment={
                    <MedipandaButton
                      type='submit'
                      variant='contained'
                      size='small'
                      color='secondary'
                      sx={{
                        paddingX: '22px',
                        borderRadius: '20px',
                      }}
                    >
                      수정하기
                    </MedipandaButton>
                  }
                  sx={{
                    height: '43px',
                    marginY: '5px',
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.gray50}`,
                  }}
                />
              )}
            />
          </form>
        ) : (
          <Typography variant='largeTextR' sx={{ color: colors.gray70 }}>
            {comment.content}
          </Typography>
        )}
        <Stack direction='row' alignItems='center' gap='30px'>
          <Typography variant='smallTextR' sx={{ color: colors.gray60, marginTop: '2px', lineHeight: '16px' }}>
            {DateUtils.formatRelativeTime(DateUtils.utcToKst(new Date(comment.createdAt)))}
          </Typography>
          <Stack
            direction='row'
            alignItems='center'
            gap='5px'
            onClick={handleLike}
            sx={{
              borderBottom: `1px solid transparent`,
              color: comment.likedByMe ? colors.vividViolet : colors.gray60,
              cursor: 'pointer',
              '&:hover': {
                borderColor: colors.gray60,
                boxSizing: 'border-box',
              },
            }}
          >
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M2.96745 9.27345L7.60252 13.6276C7.65436 13.6763 7.68028 13.7007 7.70496 13.7187C7.88082 13.8475 8.11983 13.8475 8.29569 13.7187C8.32037 13.7007 8.34629 13.6763 8.39813 13.6276L13.0332 9.27344C14.3373 8.04836 14.4957 6.03237 13.3989 4.61868L13.1926 4.35286C11.8805 2.66169 9.24675 2.94531 8.32477 4.87707C8.19454 5.14994 7.80612 5.14994 7.67588 4.87707C6.75391 2.94531 4.12014 2.66169 2.80802 4.35286L2.60178 4.61868C1.50496 6.03237 1.66333 8.04836 2.96745 9.27345Z'
                stroke='currentColor'
                strokeWidth='1.5'
              />
            </svg>
            <Typography variant='smallTextR' sx={{ marginTop: '2px', lineHeight: '16px' }}>
              좋아요 {comment.likesCount.toLocaleString()}
            </Typography>
          </Stack>
          {replies !== null && (
            <Stack
              direction='row'
              alignItems='center'
              gap='5px'
              onClick={onReplyClick}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.7,
                },
              }}
            >
              <img src='/assets/icons/icon-chat.svg' />
              <Typography variant='smallTextR' sx={{ color: colors.gray60, marginTop: '2px', lineHeight: '16px' }}>
                대댓글 {replies.length.toLocaleString()}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Popover
        open={postPopupAnchor !== null}
        anchorEl={postPopupAnchor}
        onClose={() => setPostPopupAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        elevation={0}
      >
        <Stack>
          {comment.userId === session?.userId ? (
            <>
              <MedipandaButton variant='outlined' color='error' onClick={handleDelete}>
                삭제하기
              </MedipandaButton>
              <MedipandaButton variant='outlined' onClick={handleEdit}>
                수정하기
              </MedipandaButton>
            </>
          ) : (
            <MedipandaButton variant='outlined' color='error' onClick={handleReport}>
              신고하기
            </MedipandaButton>
          )}
        </Stack>
      </Popover>
      <CommunityReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} commentId={comment.id} />
    </>
  );
}

function CommunityReportModal({
  open,
  onClose,
  commentId,
  postId,
}: {
  open?: boolean;
  onClose?: () => void;
  commentId?: number;
  postId?: number;
}) {
  const { session } = useSession();

  const [reportType, setReportType] = useState<string>('홍보/스팸');

  const handleReport = async () => {
    try {
      await createReport(session!.userId, {
        commentId: commentId ?? null,
        postId: postId ?? null,
        reportContent: reportType,
        reportType:
          {
            '홍보/스팸': ReportType.SPAM,
            '욕설/비속어': ReportType.ABUSE,
            음란물: ReportType.ILLEGAL_CONTENT,
            '개인정보 노출': ReportType.PERSONAL_INFORMATION,
          }[reportType] ?? ReportType.OTHER,
      });
      alert('신고가 접수되었습니다.');
      onClose?.();
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('신고 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (!open) {
    return null;
  }

  return (
    <MedipandaDialog open onClose={onClose} width='400px'>
      <MedipandaDialogTitle title={'신고하기'} onClose={onClose} />
      <MedipandaDialogContent>
        <Stack>
          <Typography variant='heading4R' sx={{ color: colors.gray80 }}>
            신고유형을 선택해주세요
          </Typography>
          <Stack sx={{ marginY: '20px' }}>
            <RadioGroup value={reportType} onChange={(_, value) => setReportType(value)}>
              <FormControlLabel value={'홍보/스팸'} control={<Radio size='small' />} label={'홍보/스팸'} />
              <FormControlLabel value={'음란물'} control={<Radio size='small' />} label={'음란물'} />
              <FormControlLabel value={'욕설/비속어'} control={<Radio size='small' />} label={'욕설/비속어'} />
              <FormControlLabel value={'도배성 글'} control={<Radio size='small' />} label={'도배성 글'} />
              <FormControlLabel value={'개인정보 노출'} control={<Radio size='small' />} label={'개인정보 노출'} />
              <FormControlLabel value={'부적절한 닉네임 신고'} control={<Radio size='small' />} label={'부적절한 닉네임 신고'} />
              <FormControlLabel value={'특정인 비방'} control={<Radio size='small' />} label={'특정인 비방'} />
            </RadioGroup>
          </Stack>
          <Stack direction='row' sx={{ gap: '10px', marginTop: '20px' }}>
            <MedipandaButton variant='outlined' size='large' sx={{ flex: 1 }} onClick={onClose}>
              닫기
            </MedipandaButton>
            <MedipandaButton variant='contained' size='large' sx={{ flex: 1 }} onClick={handleReport}>
              신고하기
            </MedipandaButton>
          </Stack>
        </Stack>
      </MedipandaDialogContent>
    </MedipandaDialog>
  );
}
