import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Controller } from 'react-hook-form';
import { ScaleQuestion } from '../medical-scale.schema';
import { ScaleService } from '../services/ScaleService';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { RadioButton, Checkbox, TextInput } from 'react-native-paper';
import { Info } from 'lucide-react-native';

interface QuestionRendererProps {
    question: ScaleQuestion;
    control: any;
    readOnly: boolean;
}

export const QuestionRenderer = ({ 
    question, 
    control, 
    readOnly, 
}: QuestionRendererProps) => {
    const { colors, fontSizeMultiplier } = useThemedStyles();
    const { width } = useWindowDimensions();

    const renderImage = () => {
        if (!question.image_url) return null;

        const imageUrl = ScaleService.getPublicUrl(question.image_url);
        if (!imageUrl) return null;

        return (
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: imageUrl }} 
                    style={[styles.image, { maxWidth: width - 64 }]} 
                    resizeMode="contain"
                    accessibilityLabel="Imagen de la pregunta"
                />
            </View>
        );
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: readOnly ? 0.75 : 1 }]}>
            <Text style={[styles.label, { color: colors.text, fontSize: 16 * fontSizeMultiplier }]}>
                {question.order_index}. {question.text}
                {question.validation?.required && <Text style={{ color: colors.error }}> *</Text>}
            </Text>
            
            {question.description && (
                <Text style={[styles.description, { color: colors.mutedText, fontSize: 13 * fontSizeMultiplier }]}>
                    {question.description}
                </Text>
            )}
            
            {renderImage()}

            <Controller
                control={control}
                name={question.id}
                rules={{ required: question.validation?.required }}
                render={({ field: { onChange, value } }) => {
                    
                    switch (question.type) {
                        case 'single_choice':
                            return (
                                <View style={styles.optionsContainer}>
                                    <RadioButton.Group onValueChange={onChange} value={value?.toString()}>
                                        {question.options?.map(opt => (
                                            <TouchableOpacity 
                                                key={opt.value.toString()} 
                                                onPress={() => !readOnly && onChange(opt.value)}
                                                style={styles.optionRow}
                                                disabled={readOnly}
                                            >
                                                <RadioButton.Android 
                                                    value={opt.value.toString()} 
                                                    color={colors.primary}
                                                    uncheckedColor={colors.mutedText}
                                                    disabled={readOnly}
                                                />
                                                <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </RadioButton.Group>
                                </View>
                            );

                        case 'multi_choice':
                            return (
                                <View style={styles.optionsContainer}>
                                    {question.options?.map(opt => {
                                        const isChecked = Array.isArray(value) && value.includes(opt.value);
                                        return (
                                            <TouchableOpacity 
                                                key={opt.value.toString()} 
                                                onPress={() => {
                                                    if (readOnly) return;
                                                    const newValue = isChecked
                                                        ? (value || []).filter((v: any) => v !== opt.value)
                                                        : [...(value || []), opt.value];
                                                    onChange(newValue);
                                                }}
                                                style={styles.optionRow}
                                                disabled={readOnly}
                                            >
                                                <Checkbox.Android 
                                                    status={isChecked ? 'checked' : 'unchecked'}
                                                    color={colors.primary}
                                                    uncheckedColor={colors.mutedText}
                                                    disabled={readOnly}
                                                />
                                                <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            );
                            
                        case 'slider':
                            // For simplicity using a text input or a basic slider if available
                            // But since we want to be safe, let's use a themed input and simple buttons for now
                            // OR if we can find Sliders... standard RN doesn't have it anymore (moved to community)
                            return (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        mode="outlined"
                                        label="Valor"
                                        value={value?.toString() || ''}
                                        onChangeText={(v) => onChange(Number(v))}
                                        keyboardType="numeric"
                                        disabled={readOnly}
                                        outlineColor={colors.border}
                                        activeOutlineColor={colors.primary}
                                        style={{ backgroundColor: colors.background }}
                                    />
                                    <Text style={[styles.rangeInfo, { color: colors.mutedText }]}>
                                        Rango: {question.validation?.min || 0} - {question.validation?.max || 10}
                                    </Text>
                                </View>
                            );
                            
                        case 'text':
                            return (
                                <TextInput
                                    mode="outlined"
                                    multiline
                                    numberOfLines={3}
                                    value={value || ''}
                                    onChangeText={onChange}
                                    disabled={readOnly}
                                    outlineColor={colors.border}
                                    activeOutlineColor={colors.primary}
                                    style={{ backgroundColor: colors.background }}
                                />
                            );
                            
                        case 'number':
                            return (
                                <TextInput
                                    mode="outlined"
                                    value={value?.toString() || ''}
                                    onChangeText={(v) => onChange(Number(v))}
                                    keyboardType="numeric"
                                    disabled={readOnly}
                                    outlineColor={colors.border}
                                    activeOutlineColor={colors.primary}
                                    style={{ backgroundColor: colors.background }}
                                />
                            );

                        case 'info':
                            return null; // Image and description are rendered above

                        default:
                            return (
                                <View style={styles.errorContainer}>
                                    <Info color={colors.error} size={16} />
                                    <Text style={[styles.errorText, { color: colors.error }]}>Tipo no soportado: {question.type}</Text>
                                </View>
                            );
                    }
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 22,
    },
    description: {
        marginBottom: 12,
        lineHeight: 18,
    },
    imageContainer: {
        marginVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 8,
        padding: 8,
    },
    image: {
        width: '100%',
        height: 250, // Fixed but with resizeMode contain
    },
    optionsContainer: {
        marginTop: 8,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        marginVertical: 2,
    },
    optionLabel: {
        fontSize: 15,
        marginLeft: 8,
        flex: 1,
    },
    inputContainer: {
        marginTop: 8,
    },
    rangeInfo: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        padding: 8,
        backgroundColor: 'rgba(255, 0, 0, 0.05)',
        borderRadius: 4,
    },
    errorText: {
        fontSize: 13,
        marginLeft: 8,
    }
});
