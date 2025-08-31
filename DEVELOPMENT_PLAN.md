# Font Size Slider - Proportional Scaling Development Plan

## Project Status
- **Current Branch**: `feature/proportional-font-scaling`
- **Goal**: Modify font size slider to scale all text proportionally while maintaining typography hierarchy
- **Problem**: Current implementation sets all text to same font size (flattens H1-H6 hierarchy)

## Requirements Summary
- **Functional**: Font slider scales all text proportionally (H1 > H2 > H3 > H4 > H5 > H6 > body)
- **Scope**: All markdown elements (headings, body, code, tables, lists, blockquotes)
- **Theme Compatibility**: Must work with Prism theme specifically
- **Performance**: No noticeable lag when adjusting slider
- **Default State**: When slider at 16px, should match native Obsidian appearance

## Development Approach: TDD with Real Obsidian Environment

### Why This Approach?
- **Real Environment**: Test against actual Obsidian APIs, no mocking needed
- **Proper TDD**: Write tests first, watch fail (RED), make pass (GREEN)
- **User Validation**: Manual testing in real Obsidian with real content
- **Iterative**: Deploy → Test → Record → Clean → Code → Repeat

### Development Workflow

#### Phase 1: Write Tests
1. Create Jest tests against real `FontSizeSliderPlugin` class in `main.ts`
2. Test the actual `applyFontSize()` method for proportional scaling
3. Tests should verify CSS custom properties and proportional ratios

#### Phase 2: Initial Testing (RED Phase)
1. **Deploy to development vault**: `~/Documents/Obsidian\ Vaults/Planner-Development/`
2. **Run tests in Obsidian environment** - should FAIL against current flat font sizing
3. **Record test failures** - document what's broken
4. **Clean up deployment** - remove test code from development vault

#### Phase 3: Implementation (GREEN Phase)  
1. **Modify plugin code** - Change `applyFontSize()` method in `main.ts`
2. **Implement proportional scaling** using CSS custom properties
3. **Deploy to development vault** again
4. **Run tests** - should now PASS
5. **Record success** and clean up

#### Phase 4: User Acceptance Testing
1. **Manual testing** with real markdown content in development vault
2. **Test all elements**: H1-H6, body text, code blocks, tables, lists
3. **Test with Prism theme** specifically
4. **Verify smooth slider operation** and performance
5. **Test edge cases** (min/max font sizes)

#### Phase 5: Integration
1. **Clean up any test artifacts** from plugin code
2. **Merge to main branch**
3. **Final testing** on main branch
4. **Build final version**

## Technical Implementation Plan

### CSS Approach: Proportional Ratios
```typescript
// Replace current flat sizing:
font-size: ${fontSize}px !important;

// With proportional system:
document.documentElement.style.setProperty('--font-slider-base-size', `${fontSize}px`);

// CSS rules:
h1 { font-size: calc(var(--font-slider-base-size) * 2.25) !important; }
h2 { font-size: calc(var(--font-slider-base-size) * 1.75) !important; }
// ... etc for all elements
```

### Proposed Typography Scale
- **H1**: 2.25x base size
- **H2**: 1.75x base size  
- **H3**: 1.5x base size
- **H4**: 1.25x base size
- **H5**: 1.125x base size
- **H6**: 1.0625x base size
- **Body**: 1.0x base size (slider value)
- **Code**: 0.9x base size
- **Tables**: 0.95x base size

## Files to Modify
- **Primary**: `main.ts` - `FontSizeSliderPlugin.applyFontSize()` method
- **Tests**: Create proper test files that import real plugin class
- **Documentation**: Update README if needed

## Success Criteria
- [ ] All tests pass in real Obsidian environment
- [ ] Typography hierarchy maintained at all slider positions  
- [ ] Default position (16px) matches native Obsidian appearance
- [ ] Works with Prism theme
- [ ] Smooth performance when adjusting slider
- [ ] All markdown elements scale proportionally
- [ ] No breaking changes to existing functionality

## Notes
- **Previous Attempt**: Created fake test implementation instead of testing real code (MISTAKE)
- **Key Learning**: Always test the actual plugin code, never create separate test implementations
- **Development Vault**: `~/Documents/Obsidian\ Vaults/Planner-Development/`
- **Current Method**: Flat font sizing in `main.ts:applyFontSize()` (lines 137-156)

## Next Steps
1. Write tests against real `FontSizeSliderPlugin` class
2. Deploy and run tests to confirm they fail (RED phase)
3. Implement proportional scaling in real plugin code
4. Deploy and verify tests pass (GREEN phase)
5. Manual user acceptance testing
6. Integration and cleanup