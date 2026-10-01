import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const adminMocks = vi.hoisted(() => ({
  getVideoOverride: vi.fn(),
  isAdminLoggedIn: vi.fn(),
  setVideoOverride: vi.fn(),
}));

const progressMocks = vi.hoisted(() => ({
  computeEffectiveProgress: vi.fn(),
  getCompletedSkillIds: vi.fn(),
  getPracticalSubmission: vi.fn(),
  getQuizResult: vi.fn(),
  getVideoWatched: vi.fn(),
  setPracticalSubmission: vi.fn(),
  setSkillCompletion: vi.fn(),
  setVideoWatched: vi.fn(),
}));

vi.mock('@/lib/admin-store', () => adminMocks);

vi.mock('@/lib/progress-store', () => progressMocks);

vi.mock('@/components/CelebrationBurst', () => ({
  CelebrationBurst: () => null,
}));

vi.mock('@/components/ProgressBar', () => ({
  ProgressBar: ({
    percentage,
    label,
  }: {
    percentage: number;
    label: string;
  }) => (
    <div>
      {label}: {percentage}%
    </div>
  ),
}));

import { SkillDetailBoard } from '@/components/SkillDetailBoard';
import type { Role, Skill, SkillProgress } from '@/lib/types';

const role = {
  id: 'cloud-engineer',
  name: 'Cloud Engineer',
} as Role;

const skill = {
  id: 'aws',
  name: 'AWS',
  category: 'Cloud',
  difficulty: 'beginner',
  importance: 'core',
  description: 'Learn AWS fundamentals.',
  learningResource: {
    videoTitle: 'AWS Basics',
    youtubeUrl: 'https://www.youtube.com/watch?v=aws-basics',
    note: 'Core AWS concepts',
  },
} as Skill;

const progress = {} as SkillProgress;

describe('SkillDetailBoard coverage paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.localStorage.clear();

    adminMocks.isAdminLoggedIn.mockReturnValue(false);
    adminMocks.getVideoOverride.mockReturnValue(undefined);

    progressMocks.getCompletedSkillIds.mockReturnValue(new Set());
    progressMocks.getQuizResult.mockReturnValue(undefined);
    progressMocks.getPracticalSubmission.mockReturnValue(undefined);
    progressMocks.getVideoWatched.mockReturnValue(false);

    progressMocks.computeEffectiveProgress.mockReturnValue({
      totalPercentage: 50,
      breakdown: {
        selfAssessment: 20,
        objectiveQuiz: 20,
        practicalProject: 10,
      },
    });

    progressMocks.setPracticalSubmission.mockReturnValue({
      githubUrl: 'https://github.com/pratik/example',
      status: 'pending',
    });
  });

  it('loads saved suggestions and covers learner interactions', async () => {
    window.localStorage.setItem(
      'skillorbit.videoSuggestions.skill.aws',
      JSON.stringify([
        {
          videoUrl: 'https://youtube.com/watch?v=saved',
          note: 'Saved suggestion',
        },
      ])
    );

    render(
      <SkillDetailBoard
        role={role}
        skill={skill}
        progress={progress}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('https://youtube.com/watch?v=saved')
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Saved suggestion/)).toBeInTheDocument();

    // Mark skill complete.
    const completionButton = screen.getByRole('button', {
      name: 'Mark AWS as completed',
    });

    fireEvent.click(completionButton);

    expect(progressMocks.setSkillCompletion).toHaveBeenCalledWith(
      'cloud-engineer',
      'aws',
      true
    );

    // Mark skill incomplete again.
    const completedButton = screen.getByRole('button', {
      name: 'Mark AWS as not completed',
    });

    fireEvent.click(completedButton);

    expect(progressMocks.setSkillCompletion).toHaveBeenLastCalledWith(
      'cloud-engineer',
      'aws',
      false
    );

    // Mark video watched.
    const videoButton = screen.getByRole('button', {
      name: 'Mark video watched',
    });

    fireEvent.click(videoButton);

    expect(progressMocks.setVideoWatched).toHaveBeenCalledWith(
      'cloud-engineer',
      'aws',
      true
    );

    // Open learner suggestion form.
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Suggest a tutorial video for AWS',
      })
    );

    const suggestionInput = screen.getByRole('textbox', {
      name: 'Tutorial video URL',
    });

    const suggestionForm = suggestionInput.closest('form');

    expect(suggestionForm).not.toBeNull();

    // Empty submission returns early.
    fireEvent.submit(suggestionForm!);

    expect(
      window.localStorage.getItem(
        'skillorbit.videoSuggestions.skill.aws'
      )
    ).toContain('saved');

    // Submit a valid suggestion.
    fireEvent.change(suggestionInput, {
      target: {
        value: 'https://youtube.com/watch?v=new-video',
      },
    });

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Suggestion note',
      }),
      {
        target: {
          value: 'Great beginner tutorial',
        },
      }
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Submit suggestion',
      })
    );

    expect(
      screen.getByText('https://youtube.com/watch?v=new-video')
    ).toBeInTheDocument();

    expect(
      window.localStorage.getItem(
        'skillorbit.videoSuggestions.skill.aws'
      )
    ).toContain('new-video');

    // Practical project: empty submission first.
    const githubInput = screen.getByRole('textbox', {
      name: 'GitHub repository URL',
    });

    const practicalForm = githubInput.closest('form');

    expect(practicalForm).not.toBeNull();

    fireEvent.submit(practicalForm!);

    expect(
      progressMocks.setPracticalSubmission
    ).not.toHaveBeenCalled();

    // Practical project: valid submission.
    fireEvent.change(githubInput, {
      target: {
        value: 'https://github.com/pratik/example',
      },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Submit for review',
      })
    );

    expect(
      progressMocks.setPracticalSubmission
    ).toHaveBeenCalledWith(
      'cloud-engineer',
      'aws',
      'https://github.com/pratik/example'
    );

    expect(
      screen.getByText('Submitted — pending admin review')
    ).toBeInTheDocument();
  });

  it('covers admin recommended-video editing', async () => {
    adminMocks.isAdminLoggedIn.mockReturnValue(true);

    render(
      <SkillDetailBoard
        role={role}
        skill={skill}
        progress={progress}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'Edit recommended video for AWS (admin)',
        })
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit recommended video for AWS (admin)',
      })
    );

    const titleInput = screen.getByRole('textbox', {
      name: 'Admin video title',
    });

    const adminForm = titleInput.closest('form');

    expect(adminForm).not.toBeNull();

    // Empty admin submission should return early.
    fireEvent.submit(adminForm!);

    expect(adminMocks.setVideoOverride).not.toHaveBeenCalled();

    // Fill admin form.
    fireEvent.change(titleInput, {
      target: {
        value: 'Updated AWS Tutorial',
      },
    });

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Admin video URL',
      }),
      {
        target: {
          value: 'https://youtube.com/watch?v=updated',
        },
      }
    );

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Admin video note',
      }),
      {
        target: {
          value: 'Updated by admin',
        },
      }
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Save video',
      })
    );

    expect(adminMocks.setVideoOverride).toHaveBeenCalledWith(
      'aws',
      {
        videoTitle: 'Updated AWS Tutorial',
        youtubeUrl: 'https://youtube.com/watch?v=updated',
        note: 'Updated by admin',
      }
    );

    expect(
      await screen.findByRole('link', {
        name: /Updated AWS Tutorial/,
      })
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/Updated by admin/)
    ).toBeInTheDocument();
  });

  it('shows a persisted override and keeps the form open when saving fails', async () => {
    adminMocks.isAdminLoggedIn.mockReturnValue(true);
    adminMocks.getVideoOverride.mockResolvedValue({
      videoTitle: 'Persisted Title',
      youtubeUrl: 'https://youtube.com/watch?v=persisted',
    });
    adminMocks.setVideoOverride.mockRejectedValue(new Error('Not authorised.'));

    render(<SkillDetailBoard role={role} skill={skill} progress={progress} />);

    expect(await screen.findByRole('link', { name: /Persisted Title/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit recommended video for AWS (admin)' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Admin video title' }), {
      target: { value: 'New' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Admin video URL' }), {
      target: { value: 'https://youtube.com/watch?v=new' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save video' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Not authorised.');
    expect(screen.getByRole('link', { name: /Persisted Title/ })).toBeInTheDocument();
  });

  it('handles an existing practical submission', async () => {
    progressMocks.getPracticalSubmission.mockReturnValue({
      githubUrl: 'https://github.com/pratik/already-submitted',
      status: 'pending',
    });

    render(
      <SkillDetailBoard
        role={role}
        skill={skill}
        progress={progress}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Submitted — pending admin review')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', {
        name: 'https://github.com/pratik/already-submitted',
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('textbox', {
        name: 'GitHub repository URL',
      })
    ).not.toBeInTheDocument();
  });

  it('handles localStorage read failures', async () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

    render(
      <SkillDetailBoard
        role={role}
        skill={skill}
        progress={progress}
      />
    );

    await waitFor(() => {
      expect(adminMocks.getVideoOverride).toHaveBeenCalledWith('aws');
    });

    expect(
      screen.queryByText(/Saved suggestion/)
    ).not.toBeInTheDocument();

    getItemSpy.mockRestore();
  });
});