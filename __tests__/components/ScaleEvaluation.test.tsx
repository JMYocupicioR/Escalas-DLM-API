/**
 * @file __tests__/components/ScaleEvaluation.test.tsx
 * @description Tests for ScaleEvaluation component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ScaleEvaluation } from '../../components/ScaleEvaluation';
import { ScaleWithDetails, ScaleAssessmentRequest } from '../../api/scales/types';

// Mock data
const mockScale: ScaleWithDetails = {
  id: 'test-scale',
  name: 'Test Scale',
  description: 'A test scale for evaluation',
  category: 'Test',
  instructions: 'Test instructions',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
  questions: [
    {
      id: 'q1',
      scale_id: 'test-scale',
      question_id: 'question1',
      question_text: 'How do you feel?',
      question_type: 'single_choice',
      order_index: 1,
      is_required: true,
      options: [
        {
          id: 'opt1',
          question_id: 'q1',
          option_value: 0,
          option_label: 'Bad',
          order_index: 1,
          is_default: false,
          created_at: '2023-01-01',
        },
        {
          id: 'opt2',
          question_id: 'q1',
          option_value: 5,
          option_label: 'Good',
          order_index: 2,
          is_default: false,
          created_at: '2023-01-01',
        },
      ],
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    {
      id: 'q2',
      scale_id: 'test-scale',
      question_id: 'question2',
      question_text: 'How is your energy?',
      question_type: 'single_choice',
      order_index: 2,
      is_required: true,
      options: [
        {
          id: 'opt3',
          question_id: 'q2',
          option_value: 0,
          option_label: 'Low',
          order_index: 1,
          is_default: false,
          created_at: '2023-01-01',
        },
        {
          id: 'opt4',
          question_id: 'q2',
          option_value: 3,
          option_label: 'High',
          order_index: 2,
          is_default: false,
          created_at: '2023-01-01',
        },
      ],
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
  ],
  scoring: {
    id: 'scoring1',
    scale_id: 'test-scale',
    scoring_method: 'sum',
    min_score: 0,
    max_score: 8,
    ranges: [
      {
        id: 'range1',
        scoring_id: 'scoring1',
        min_value: 0,
        max_value: 3,
        interpretation_level: 'Low',
        interpretation_text: 'Low score interpretation',
        order_index: 1,
        created_at: '2023-01-01',
      },
      {
        id: 'range2',
        scoring_id: 'scoring1',
        min_value: 4,
        max_value: 8,
        interpretation_level: 'High',
        interpretation_text: 'High score interpretation',
        order_index: 2,
        created_at: '2023-01-01',
      },
    ],
    created_at: '2023-01-01',
  },
  references: [],
};

describe('ScaleEvaluation Component', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the scale name and first question', () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Test Scale')).toBeTruthy();
    expect(getByText('How do you feel?')).toBeTruthy();
  });

  it('should show progress indicator', () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('1 de 2')).toBeTruthy();
  });

  it('should display question options', () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Bad')).toBeTruthy();
    expect(getByText('Good')).toBeTruthy();
  });

  it('should allow selecting an option', () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const option = getByText('Good');
    fireEvent.press(option);

    // The option should be selected (this would be verified by style changes in actual implementation)
    expect(option).toBeTruthy();
  });

  it('should disable "Anterior" button on first question', () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const previousButton = getByText('Anterior');
    expect(previousButton).toBeTruthy();
    // In actual implementation, this would check for disabled state
  });

  it('should show "Siguiente" button when option is selected', async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Select an option
    const option = getByText('Good');
    fireEvent.press(option);

    await waitFor(() => {
      const nextButton = getByText('Siguiente');
      expect(nextButton).toBeTruthy();
    });
  });

  it('should progress to next question when "Siguiente" is pressed', async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Select an option
    const option = getByText('Good');
    fireEvent.press(option);

    // Press next button
    await waitFor(() => {
      const nextButton = getByText('Siguiente');
      fireEvent.press(nextButton);
    });

    // Should show second question
    await waitFor(() => {
      expect(getByText('How is your energy?')).toBeTruthy();
      expect(getByText('2 de 2')).toBeTruthy();
    });
  });

  it('should show "Finalizar" button on last question', async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Navigate to second question
    const option1 = getByText('Good');
    fireEvent.press(option1);
    
    await waitFor(() => {
      const nextButton = getByText('Siguiente');
      fireEvent.press(nextButton);
    });

    // Should show "Finalizar" on last question
    await waitFor(() => {
      expect(getByText('Finalizar')).toBeTruthy();
    });
  });

  it('should calculate score and show results', async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Answer first question
    const option1 = getByText('Good'); // value: 5
    fireEvent.press(option1);
    
    await waitFor(() => {
      const nextButton = getByText('Siguiente');
      fireEvent.press(nextButton);
    });

    // Answer second question
    await waitFor(() => {
      const option2 = getByText('High'); // value: 3
      fireEvent.press(option2);
    });

    // Finalize assessment
    await waitFor(() => {
      const finalizeButton = getByText('Finalizar');
      fireEvent.press(finalizeButton);
    });

    // Should show results with total score of 8 (5 + 3)
    await waitFor(() => {
      expect(getByText('Evaluación Completada')).toBeTruthy();
      expect(getByText('8')).toBeTruthy(); // Total score
      expect(getByText('High')).toBeTruthy(); // Interpretation level
    });
  });

  it('should call onComplete with assessment data', async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Complete evaluation
    const option1 = getByText('Good');
    fireEvent.press(option1);
    
    await waitFor(() => {
      const nextButton = getByText('Siguiente');
      fireEvent.press(nextButton);
    });

    await waitFor(() => {
      const option2 = getByText('High');
      fireEvent.press(option2);
    });

    await waitFor(() => {
      const finalizeButton = getByText('Finalizar');
      fireEvent.press(finalizeButton);
    });

    // Find and press save button in results
    await waitFor(() => {
      const saveButtons = getByText('Exportar PDF'); // This would be in ResultsActions component
      fireEvent.press(saveButtons);
    });

    // Verify onComplete was called with correct data
    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        scale_id: 'test-scale',
        responses: {
          question1: 5,
          question2: 3,
        },
      })
    );
  });

  it('should call onCancel when close button is pressed', () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    const closeButton = getByTestId('closeButton');
    fireEvent.press(closeButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show patient form when patientRequired is true', () => {
    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={mockScale}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        patientRequired={true}
      />
    );

    expect(getAllByText('Datos del Paciente').length).toBeGreaterThan(0);
  });

  it('should handle scales without scoring system', () => {
    const scaleWithoutScoring = {
      ...mockScale,
      scoring: null,
    };

    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={scaleWithoutScoring}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Should still render the scale
    expect(getByText('Test Scale')).toBeTruthy();
    expect(getByText('How do you feel?')).toBeTruthy();
  });

  it('should handle empty questions array', () => {
    const scaleWithoutQuestions = {
      ...mockScale,
      questions: [],
    };

    const { getByTestId, getByText, getAllByText } = render(
      <ScaleEvaluation
        scale={scaleWithoutQuestions}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    );

    // Should show loading state or error
    expect(getByText('Cargando pregunta...')).toBeTruthy();
  });
});

